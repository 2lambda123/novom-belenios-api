import {
  DeleteCommand,
  BatchGetCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import log from '../lib/logger/log';
import dynamoDBDocumentClient from '../lib/dynamoDB/dynamoDBDocumentClient';
import deepmerge from 'deepmerge';

class Model {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async put(election, extraParams) {
    const params = {
      TableName: this.tableName,
      Item: election,
      ...extraParams,
    };

    try {
      const data = await dynamoDBDocumentClient.send(new PutCommand(params));
      return data;
    } catch (error) {
      log('error', JSON.stringify(error));
    }

    return null;
  }

  async get(id, extraParams) {
    const params = {
      TableName: this.tableName,
      Key: { id },
      ...extraParams,
    };

    try {
      const data = await dynamoDBDocumentClient.send(new GetCommand(params));
      return data ? data.Item : null;
    } catch (error) {
      log('error', JSON.stringify(error));
    }

    return null;
  }

  async batchGet(ids, extraParams) {
    const params = {
      TableName: this.tableName,
      keys: ids,
      ...extraParams,
    };

    try {
      const data = await dynamoDBDocumentClient.send(new BatchGetCommand(params));
      return data;
    } catch (error) {
      log('error', JSON.stringify(error));
    }
    return null;
  }

  async delete(id, extraParams) {
    const params = {
      TableName: this.tableName,
      Key: { id },
      ...extraParams,
    };

    try {
      const { Item } = await dynamoDBDocumentClient.send(new DeleteCommand(params));
      return Item;
    } catch (error) {
      log('error', JSON.stringify(error));
    }

    return null;
  }

  async query(params) {
    const mergedParams = {
      TableName: this.tableName,
      ...params,
    };

    try {
      const { Items } = await dynamoDBDocumentClient.send(new QueryCommand(mergedParams));
      return Items;
    } catch (error) {
      log('error', JSON.stringify(error));
    }

    return null;
  }

  async UNSAFE_query(params) {
    const mergedParams = {
      TableName: this.tableName,
      ...params,
    };

    const result = await dynamoDBDocumentClient.send(new QueryCommand(mergedParams));
    if (result.LastEvaluatedKey) {
      const missingResult = await this.UNSAFE_query({
        ...params,
        ExclusiveStartKey: result.LastEvaluatedKey,
      });

      return deepmerge(result, missingResult);
    }

    return result;
  }

  async update(id, item, extraParams) {
    const UpdateExpression = `set ${Object.keys(item).map((k) => `#${k} = :${k}`).join(', ')}`;
    const ExpressionAttributeNames = Object.entries(item).reduce((acc, cur) => ({ ...acc, [`#${cur[0]}`]: cur[0] }), {});
    const ExpressionAttributeValues = Object.entries(item).reduce((acc, cur) => ({ ...acc, [`:${cur[0]}`]: cur[1] }), {});

    const params = {
      TableName: this.tableName,
      Key: { id },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ...extraParams,
    };

    try {
      const data = await dynamoDBDocumentClient.send(new UpdateCommand(params));
      return data;
    } catch (error) {
      log('error', JSON.stringify(error));
    }

    return null;
  }
}

export default Model;
