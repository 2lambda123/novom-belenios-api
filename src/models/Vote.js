import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import moment from 'moment';
import log from '../lib/logger/log';
import dynamoDBDocumentClient from '../lib/dynamoDB/dynamoDBDocumentClient';
import Model from './Model';
import ELECTION_STATUS from '../lib/enums/ElectionStatus';

class VoteModel extends Model {
  constructor() {
    super('Vote');

    const { TABLE } = process.env;
    this.tableName = TABLE;
  }

  async transactionVote(electionId, encryptedBallot, ttl) {
    const now = moment.utc().toISOString();
    const publicKey = JSON.parse(encryptedBallot).signature.public_key;
    const id = `${this.type}_${publicKey}`;
    const voteExists = !!(await this.get(id, { ConsistentRead: true }));

    const putItem = {
      Put: {
        TableName: this.tableName,
        Item: {
          id,
          type: this.type,
          parentId: electionId,
          ballot: encryptedBallot,
          createdAt: now,
          version: 1,
          ttl,
        },
        ConditionExpression: 'attribute_not_exists(id)',
      },
    };

    const updateItem = {
      Update: {
        TableName: this.tableName,
        Key: {
          id,
          type: this.type,
        },
        UpdateExpression: 'ADD #counter :increment SET #ballot = :ballot',
        ExpressionAttributeNames: {
          '#counter': 'version',
          '#ballot': 'ballot',
        },
        ExpressionAttributeValues: {
          ':increment': 1,
          ':ballot': encryptedBallot,
        },
      },
    };

    const updateVotesSentCount = {
      Update: {
        TableName: this.tableName,
        Key: {
          id: electionId,
          type: 'Election',
        },
        ConditionExpression: '#status = :opened',
        UpdateExpression: 'ADD #counter :increment',
        ExpressionAttributeNames: {
          '#counter': 'votesSentCount',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':increment': 1,
          ':opened': ELECTION_STATUS.OPENED,
        },
      },
    };

    const params = {
      TransactItems: [
        voteExists ? updateItem : putItem,
        updateVotesSentCount,
      ],
    };

    try {
      await dynamoDBDocumentClient.send(new TransactWriteCommand(params));
      return id;
    } catch (error) {
      log('error', JSON.stringify(error));
      return undefined;
    }
  }
}

export default VoteModel;
