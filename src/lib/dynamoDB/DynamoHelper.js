import { DynamoDB } from 'aws-sdk'; // eslint-disable-line no-unused-vars
import deepmerge from 'deepmerge';
import { v4 as uuid } from 'uuid';

import apolloErrors from '../apollo/apolloErrors';
import buildUpdateExpression from '../helpers/buildUpdateExpression';
import { buildDeleteRequests, buildPutRequests } from './helpers';

class DynamoHelper {
  /**
   * Creates an instance of DynamoHelper.
   *
   * @param {DynamoDB.DocumentClient} AWSClient
   * @param {Object} errors
   * @memberof DynamoHelper
   */
  constructor(AWSClient, errors) {
    const { TABLE } = process.env;

    this.client = AWSClient;
    this.tableName = TABLE;
    this.errors = errors;
    this.gsi1 = process.env.GSI1;
    this.gsi2 = process.env.GSI2;
    this.lsi1 = process.env.LSI1;
  }

  /**
   * Batch write element until there is no UnprocessedItems left.
   *
   * @see [AWS.DynamoDB.batchWrite()](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#batchWrite-property)
   *
   * @param {DocumentClient.BatchWriteItemInput} params
   * @memberof DynamoHelper
   */
  async batchWriteUnprocessedItemSafe(params) {
    const result = await this.client.batchWrite(params).promise();
    const { UnprocessedItems: RequestItems } = result;

    if (RequestItems && Object.keys(RequestItems).length > 0) {
      return this.batchWriteUnprocessedItemSafe({ RequestItems });
    }

    return result;
  }

  /**
   * Recursively batch write elements as the "batchWrite" function
   * takes a maximum of 25 operations at a time.
   *
   * @see [AWS.DynamoDB.batchWrite()](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#batchWrite-property)
   *
   * @param {Array} writeItems
   * @param {Number} start
   * @memberof DynamoHelper
   */
  async batchWrite(writeItems, start = 0, recursive = true) {
    if (writeItems.length === 0) {
      return undefined;
    }

    const end = start + 25;
    const toInsert = writeItems.slice(start, end);

    const params = {
      RequestItems: {
        [this.tableName]: toInsert,
      },
    };

    const result = await this.batchWriteUnprocessedItemSafe(params);

    if (recursive && end <= writeItems.length - 1) {
      return this.batchWrite(writeItems, end);
    }

    return result;
  }

  /**
   * Create a new item with a certain type.
   *
   * @param {string} type
   * @param {Object<string, any>} fields
   * @param {string} [parentId='none']
   * @param {Partial<DynamoDB.DocumentClient.PutItemInput>} [extraParams={}]
   * @returns
   * @memberof DynamoHelper
   */
  async create(type, fields, parentId = 'none', extraParams = {}) {
    const id = fields.id || `${type}_${uuid()}`;

    const newItem = {
      ...fields,
      id,
      parentId,
      type,
    };
    await this.client.put(deepmerge(extraParams, {
      Item: newItem,
      TableName: this.tableName,
    })).promise();
    return newItem;
  }

  async createBatch(type, items, parentId = 'none', recursive = true) {
    const { newItems, putRequests } = buildPutRequests(parentId, type, items);
    await this.batchWrite(putRequests, 0, recursive);
    return newItems;
  }

  /**
   * Get an item of a given type.
   *
   * @param {string} type
   * @param {string} id
   * @param {Partial<DynamoDB.DocumentClient.GetItemInput>} [extraParams={}]
   * @returns
   * @memberof DynamoHelper
   */
  async get(type, id, extraParams = {}) {
    const params = deepmerge({
      Key: { id, type },
      TableName: this.tableName,
      ...extraParams,
    }, extraParams);

    const { Item } = await this.client.get(params).promise();

    return Item;
  }

  /**
   * Get an item of a given id
   *
   * @param {string} id
   * @returns
   * @memberof DynamoHelper
   */
  async getById(id) {
    const type = id.split('_')[0];

    const params = {
      Key: { id, type },
      TableName: this.tableName,
    };
    const { Item } = await this.client.get(params).promise();

    return Item;
  }

  // eslint-disable-next-line camelcase
  async UNSAFE_query(params) {
    const result = await this.client.query(params).promise();
    if (result.LastEvaluatedKey) {
      const missingResult = await this.UNSAFE_query({
        ...params,
        ExclusiveStartKey: result.LastEvaluatedKey,
      });

      return deepmerge(result, missingResult);
    }

    return result;
  }

  /**
   * Query all items of a given type.
   *
   * @param {string} type
   * @param {Partial<DynamoDB.QueryInput>} [params={}]
   * @returns
   * @memberof DynamoHelper
   */
  async queryType(type, params = {}) {
    const { KeyConditionExpression } = params;

    const mergedParams = deepmerge(params, {
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':type': type,
      },
      KeyConditionExpression: KeyConditionExpression
        ? `#type = :type and (${KeyConditionExpression})`
        : '#type = :type',
      TableName: this.tableName,
    });
    return this.client.query(mergedParams).promise();
  }

  // eslint-disable-next-line camelcase
  async UNSAFE_queryType(type, params = {}) {
    const { KeyConditionExpression } = params;

    const mergedParams = deepmerge(params, {
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':type': type,
      },
      KeyConditionExpression: KeyConditionExpression
        ? `#type = :type and (${KeyConditionExpression})`
        : '#type = :type',
      TableName: this.tableName,
    });
    const { Items } = await this.UNSAFE_query(mergedParams);

    return Items;
  }

  /**
   * Query all items of a given type under a parent.
   *
   * @param {string} type
   * @param {string} parentId
   * @param {Partial<DynamoDB.QueryInput>} [params={}]
   * @returns
   * @memberof DynamoHelper
   */
  async queryTypeWithParent(type, parentId, params = {}) {
    const mergedParams = deepmerge(params, {
      ExpressionAttributeNames: {
        '#parentId': 'parentId',
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':parentId': parentId,
        ':type': type,
      },
      IndexName: this.lsi1,
      KeyConditionExpression: '#type = :type and #parentId = :parentId',
      TableName: this.tableName,
    });
    return this.client.query(mergedParams).promise();
  }

  // eslint-disable-next-line camelcase
  async UNSAFE_queryTypeWithParent(type, parentId, params = {}) {
    const mergedParams = deepmerge(params, {
      ExpressionAttributeNames: {
        '#parentId': 'parentId',
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':parentId': parentId,
        ':type': type,
      },
      IndexName: this.lsi1,
      KeyConditionExpression: '#type = :type and #parentId = :parentId',
      TableName: this.tableName,
    });
    const { Items } = await this.UNSAFE_query(mergedParams);

    return Items;
  }

  /**
   * Update an item with a certain type.
   *
   * @param {string} type
   * @param {string} id
   * @param {Object<string, any>} fields
   * @param {Partial<DynamoDB.DocumentClient.UpdateItemInput>} [extraParams={}]
   * @returns
   * @memberof DynamoHelper
   */
  async update(type, id, fields, extraParams = {}) {
    const { ConditionExpression } = extraParams;
    const { type: _, id: __, ...filteredFields } = fields;
    const { attributeNames, attributeValues, expression } = buildUpdateExpression(filteredFields);

    const params = deepmerge(extraParams, {
      ConditionExpression: ConditionExpression
        ? `#type = :type and #id = :id and (${ConditionExpression})`
        : '#type = :type and #id = :id',
      ExpressionAttributeNames: {
        '#id': 'id',
        '#type': 'type',
        ...attributeNames,
      },
      ExpressionAttributeValues: {
        ...attributeValues,
        ':id': id,
        ':type': type,
      },
      Key: { id, type },
      ReturnValues: 'ALL_NEW',
      TableName: this.tableName,
      UpdateExpression: expression,
    });

    const { Attributes } = await this.client.update(params).promise();
    return Attributes;
  }

  async updateBatch(type, items, parentId = 'none') {
    return this.createBatch(type, items, parentId);
  }

  /**
   * Delate an item of a given type.
   *
   * @param {string} type
   * @param {string} id
   * @param {Partial<DynamoDB.DocumentClient.DeleteItemInput>} [extraParams={}]
   * @memberof DynamoHelper
   */
  async delete(type, id, extraParams = {}) {
    const params = deepmerge(extraParams, {
      Key: { id, type },
      TableName: this.tableName,
    });

    return this.client.delete(params).promise();
  }

  async deleteBatch(type, items, recursive = true) {
    return this.batchWrite(buildDeleteRequests(type, items), 0, recursive);
  }
}

const AWSClient = new DynamoDB.DocumentClient({ convertEmptyValues: true, region: 'ca-central-1' });
const dynamoHelper = new DynamoHelper(AWSClient, apolloErrors);

export default dynamoHelper;
