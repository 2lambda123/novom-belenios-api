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

class Model {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async put(election) {
    const params = {
      TableName: this.tableName,
      Item: election,
    };

    try {
      const data = await dynamoDBDocumentClient.send(new PutCommand(params));
      return data;
    } catch (error) {
      log('error', JSON.stringify(error));
    }

    return null;
  }

  async get(id) {
    const params = {
      TableName: this.tableName,
      Key: { id },
    };

    try {
      const data = await dynamoDBDocumentClient.send(new GetCommand(params));
      return data ? data.Item : null;
    } catch (error) {
      log('error', JSON.stringify(error));
    }

    return null;
  }

  async batchGet(ids) {
    const params = {
      TableName: this.tableName,
      keys: ids,
    };

    try {
      const data = await dynamoDBDocumentClient.send(new BatchGetCommand(params));
      return data;
    } catch (error) {
      log('error', JSON.stringify(error));
    }
    return null;
  }

  async delete(id) {
    const params = {
      TableName: this.tableName,
      Key: { id },
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

  async update(id, item) {
    const UpdateExpression = `set ${Object.keys(item).map((k) => `#${k} = :${k}`).join(', ')}`;
    const ExpressionAttributeNames = Object.entries(item).reduce((acc, cur) => ({ ...acc, [`#${cur[0]}`]: cur[0] }), {});
    const ExpressionAttributeValues = Object.entries(item).reduce((acc, cur) => ({ ...acc, [`:${cur[0]}`]: cur[1] }), {});

    const params = {
      TableName: this.tableName,
      Key: { id },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
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
