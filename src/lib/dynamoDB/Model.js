import moment from 'moment';
import { v4 as uuid } from 'uuid';

import { asyncMap, asyncReduce } from '../helpers/asyncIterators';
import dynamoHelper from './DynamoHelper';

class Model {
  /**
   * Creates an instance of Model.
   *
   * @param {string} type
   * @memberof Model
   */
  constructor(type) {
    this.type = type;
    this.controlledFields = {};
    this.relationFields = [];
    this.helper = dynamoHelper;

    this.handleItemCreate = this.handleItemCreate.bind(this);
    this.handleItemUpdate = this.handleItemUpdate.bind(this);
  }

  /**
   * Inject the map for this model's fields.
   *
   * @param {Object} controlledFields
   * @memberof Model
   */
  setControlledFields(controlledFields) {
    this.controlledFields = controlledFields;
    this.relationFields = Object.keys(controlledFields).filter((field) => typeof controlledFields[field] === 'object');
  }

  /**
   * Handles the controlledKeys when updating and creating.
   *
   * @param {Object} fields
   * @param {string} id
   * @param {Function} modelHandler
   * @memberof Model
   */
  async handleControlledKeys(fields, id, modelHandler) {
    const newFields = await asyncReduce(
      Object.keys(this.controlledFields),
      async (acc, fieldName) => {
        if (!fields[fieldName]) {
          return acc;
        }
        if (typeof this.controlledFields[fieldName] === 'string') {
          // Renaming a field
          const { [fieldName]: value, ...rest } = acc;
          return {
            ...rest,
            [this.controlledFields[fieldName]]: value,
          };
        }
        if (typeof this.controlledFields[fieldName] === 'function') {
          // Modifying a field using a supplied function
          return {
            ...acc,
            [fieldName]: this.controlledFields[fieldName](fields[fieldName]),
          };
        }

        // Delegating to other model
        return {
          ...acc,
          [fieldName]: await modelHandler(id, fieldName, fields),
        };
      },
      { ...fields },
    );

    return newFields;
  }

  /**
   * Handle a relationship field when creating.
   *
   * @param {string} parentId
   * @param {string} fieldName
   * @param {Object} fields
   * @returns
   * @memberof Model
   */
  async handleItemCreate(parentId, fieldName, fields) {
    const { model, relation } = this.controlledFields[fieldName];
    const { ttl } = fields;

    switch (relation) {
      case 'one-to-many':
        return model.createOneMany(fields[fieldName].map((item) => ({ ttl, ...item })), parentId);
      case 'one-to-one':
        return (await model.create({ ttl, ...fields[fieldName] }, parentId)).id;
      default:
        return (await model.create({ ttl, ...fields[fieldName] }, parentId)).id;
    }
  }

  /**
   * Handle a relationship field when updating.
   *
   * @param {string} parentId
   * @param {string} fieldName
   * @param {Object} fields
   * @returns
   * @memberof Model
   */
  async handleItemUpdate(parentId, fieldName, fields) {
    const { model, relation } = this.controlledFields[fieldName];

    switch (relation) {
      case 'one-to-many':
        return model.syncOneMany(fields[fieldName], parentId);
      case 'one-to-one':
        return (await model.update(fields[fieldName].id, fields[fieldName])).id;
      default:
        return (await model.update(fields[fieldName].id, fields[fieldName])).id;
    }
  }

  /**
   * Handles deletion of an item.
   * Will delete any relation with "cascade: true".
   *
   * @param {Object} item
   * @memberof Model
   */
  async handleItemDelete(item) {
    const promises = this.relationFields.map(async (fieldName) => {
      const { cascade, model } = this.controlledFields[fieldName];
      if (!cascade) {
        return;
      }

      await model.deleteOneMany(item.id);
    });
    await Promise.all(promises);
  }

  /**
   * Create a new item.
   *
   * @param {Object} fields Data of the item to create.
   * @param {string} [parentId='none'] Create the item as a child. Used in one to one relationships.
   * @param {Partial<import('aws-sdk').DynamoDB.DocumentClient.PutItemInput>} [extraParams]
   * @returns
   * @memberof Model
   */
  async create(fields, parentId = 'none', extraParams) {
    const now = moment.utc().toISOString();
    const id = `${this.type}_${this.createId ? this.createId(fields, parentId) : uuid()}`;
    const { ttl: parentTTL } = await this.helper.getById(parentId) || {};
    const newFields = {
      ...fields,
      ttl: fields.ttl || parentTTL,
    };

    const referencedFields = await this.handleControlledKeys(newFields, id, this.handleItemCreate);

    return this.helper.create(
      this.type,
      { id, ...referencedFields, createdAt: now },
      parentId,
      extraParams,
    );
  }

  /**
   * Create a collection of items of this model's type.
   *
   * @param {Array} items
   * @param {string} [parentId='none']
   * @memberof Model
   */
  async createBatch(items, parentId = 'none', recursive = true) {
    const now = moment.utc().toISOString();

    const { ttl: parentTTL } = await this.helper.getById(parentId) || {};

    const promises = items.map(async (item) => {
      const id = `${this.type}_${this.createId ? this.createId(item, parentId) : uuid()}`;
      const newItem = {
        ...item,
        ttl: item.ttl || parentTTL,
      };
      const referencedFields = await this.handleControlledKeys(newItem, id, this.handleItemCreate);
      return {
        id, ttl: parentTTL, ...referencedFields, createdAt: now,
      };
    });
    const processedItems = await Promise.all(promises);

    return this.helper.createBatch(this.type, processedItems, parentId, recursive);
  }

  /**
   * Create many items for a one to many relationship.
   *
   * Uses createBatch internally.
   *
   * @param {Array} items Items to create.
   * @param {string} parentId Id the items will be a child of.
   * @returns {Promise<Array<string>>} Created items' ids.
   * @memberof Model
   */
  async createOneMany(items, parentId) {
    const createdItems = await this.createBatch(items, parentId);

    return createdItems.map((item) => item.id);
  }

  /**
   * Retrieve an item of this model's type.
   *
   * @param {string} id
   * @returns
   * @memberof Model
   */
  async get(id) {
    return this.helper.get(this.type, id);
  }

  /**
   * Retrieve all items of this model's type.
   *
   * @param {Object} [args]
   * @param {Partial<import('aws-sdk').DynamoDB.DocumentClient.QueryInput>} [args.params]
   * @param {string} [args.start]
   * @param {'items'|string} [args.itemsName='items']
   * @returns
   * @memberof Model
   */
  async getAll(args = {}) {
    const {
      params,
      start = null,
      itemsName = 'items',
    } = args;

    const mergedParams = {
      ...params,
      ...(start ? { ExclusiveStartKey: JSON.parse(start) } : {}),
    };
    const query = await this.helper.queryType(this.type, mergedParams);

    return {
      [itemsName]: query.Items,
      lastEvaluated: JSON.stringify(query.LastEvaluatedKey),
    };
  }

  /**
   * Retrieve all items of this model's type.
   * This is unsafe because pagination is handled server-side which
   * can result in timeouts and other errors.
   *
   * @param {Partial<import('aws-sdk').DynamoDB.DocumentClient.QueryInput>} [params]
   * @returns
   * @memberof Model
   */
  // eslint-disable-next-line camelcase
  async UNSAFE_getAll(params) {
    return this.helper.UNSAFE_queryType(this.type, params);
  }

  /**
   * Retrieve all items of this model's type that are a child
   * of a given id.
   *
   * @param {Object} args
   * @param {string} args.parentId
   * @param {Partial<import('aws-sdk').DynamoDB.DocumentClient.QueryInput>} [args.params]
   * @param {string} [args.start]
   * @param {string} [args.itemsName]
   * @returns
   * @memberof Model
   */
  async getAllWithParent(args) {
    const {
      parentId,
      params,
      start = null,
      itemsName = 'items',
    } = args;

    const mergedParams = {
      ...params,
      ...(start ? { ExclusiveStartKey: JSON.parse(start) } : {}),
    };

    const query = await this.helper.queryTypeWithParent(this.type, parentId, mergedParams);

    return {
      [itemsName]: query.Items,
      lastEvaluated: JSON.stringify(query.LastEvaluatedKey),
    };
  }

  /**
   * Retrieve all items of this model's type that are a child
   * of a given id.
   * This is unsafe because pagination is handled server-side which
   * can result in timeouts and other errors.
   *
   * @param {string} parentId
   * @param {Partial<import('aws-sdk').DynamoDB.DocumentClient.QueryInput>} [params]
   * @returns
   * @memberof Model
   */
  // eslint-disable-next-line camelcase
  UNSAFE_getAllWithParent(parentId, params) {
    return this.helper.UNSAFE_queryTypeWithParent(this.type, parentId, params);
  }

  /**
   * Update an item.
   *
   * @param {string} id
   * @param {Object} fields
   * @param {Partial<import('aws-sdk').DynamoDB.DocumentClient.UpdateItemInput>} [extraParams]
   * @returns
   * @memberof Model
   */
  async update(id, fields, extraParams) {
    const now = moment.utc().toISOString();
    const referencedFields = await this.handleControlledKeys(fields, id, this.handleItemUpdate);

    return this.helper.update(this.type, id, { ...referencedFields, updatedAt: now }, extraParams);
  }

  /**
   * Update a collection of items of this model's type.
   *
   * @param {Array} items
   * @param {string} [parentId='none']
   * @memberof Model
   */
  async updateBatch(items, parentId = 'none') {
    const now = moment.utc().toISOString();
    const promises = items.map(async (item) => {
      const referencedFields = await this.handleControlledKeys(
        item,
        item.id,
        this.handleItemUpdate,
      );

      return { ...referencedFields, updatedAt: now };
    });
    const processedItems = await Promise.all(promises);

    return this.helper.updateBatch(this.type, processedItems, parentId);
  }

  /**
   * Sync a one-to-many relationship.
   * It will delete missing items and create new ones
   * in the provided "items" parameter.
   *
   * @param {Array} items
   * @param {string} parentId
   * @returns {Promise<Array<string>>} Updated items' ids.
   * @memberof Model
   */
  async syncOneMany(items, parentId) {
    const currentItems = await this.helper.UNSAFE_queryTypeWithParent(this.type, parentId, {
      ExpressionAttributeNames: {
        '#id': 'id',
      },
      ProjectionExpression: '#id',
    });
    const { newItems, existingItems } = items.reduce((acc, item) => {
      if (item.id) {
        return {
          existingItems: [
            ...acc.existingItems,
            item,
          ],
          newItems: acc.newItems,
        };
      }
      return {
        existingItems: acc.existingItems,
        newItems: [
          ...acc.newItems,
          item,
        ],
      };
    }, { existingItems: [], newItems: [] });
    const removedItemIds = currentItems.filter((eI) => (
      !existingItems.some((item) => item.id === eI.id)
    )).map((item) => item.id);
    await this.deleteBatch(removedItemIds);
    const createdItems = await this.createBatch(newItems, parentId);

    const processedItems = await asyncMap(existingItems, async (item) => {
      const referencedFields = await this.handleControlledKeys(
        item,
        item.id,
        this.handleItemUpdate,
      );
      return referencedFields;
    });
    const updatedItems = await this.helper.updateBatch(this.type, processedItems, parentId);

    return [...updatedItems.map((item) => item.id), ...createdItems.map((item) => item.id)];
  }

  /**
   * Delete an item.
   *
   * @param {string} id
   * @param {Partial<import('aws-sdk').DynamoDB.DocumentClient.DeleteItemInput>} [extraParams]
   * @memberof Model
   */
  async delete(id, extraParams) {
    await this.handleItemDelete({ id });

    return this.helper.delete(this.type, id, extraParams);
  }

  /**
   * Delete a collection of items.
   *
   * @param {Array<string>} ids
   * @param {boolean} [recursive]
   * @memberof Model
   */
  async deleteBatch(ids, recursive = true) {
    const promises = ids.map((id) => (
      this.handleItemDelete({ id })
    ));

    await Promise.all(promises);
    return this.helper.deleteBatch(this.type, ids, recursive);
  }

  /**
   * Delete a collection of items with provided parentId.
   *
   * @param {string} parentId
   * @memberof Model
   */
  async deleteOneMany(parentId) {
    const items = await this.helper.UNSAFE_queryTypeWithParent(this.type, parentId);
    const promises = items.map((item) => (
      this.handleItemDelete(item)
    ));
    await Promise.all(promises);

    await this.helper.deleteBatch(this.type, items);
  }
}

export default Model;
