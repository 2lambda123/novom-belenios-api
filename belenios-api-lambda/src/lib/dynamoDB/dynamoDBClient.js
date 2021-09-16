import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const { DYNAMODB_REGION } = process.env;

const dynamoDBClient = new DynamoDBClient({ region: DYNAMODB_REGION });

export default dynamoDBClient;
