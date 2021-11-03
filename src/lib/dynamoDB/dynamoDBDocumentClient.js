import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dynamoDBClient from './dynamoDBClient';

const marshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: false,
  convertClassInstanceToMap: false,
};

const unmarshallOptions = {
  wrapNumbers: false,
};

const translateConfig = { marshallOptions, unmarshallOptions };

const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient, translateConfig);

export default dynamoDBDocumentClient;
