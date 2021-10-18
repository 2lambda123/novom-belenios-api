import {
  DeleteCommand,
  BatchGetCommand,
  GetCommand,
  PutCommand,
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
}

export default Model;
