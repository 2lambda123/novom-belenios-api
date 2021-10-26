import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import log from '../lib/logger/log';
import dynamoDBDocumentClient from '../lib/dynamoDB/dynamoDBDocumentClient';
import Model from './Model';

class VoteModel extends Model {
  constructor() {
    super(process.env.DYNAMODB_VOTE_TABLE);

    this.electionnIdGSIName = process.env.DYNAMODB_VOTE_TABLE_GSI_ELECTION_ID;
  }

  async getAllElectionVotes(electionId) {
    return this.query({
      ExpressionAttributeNames: {
        '#electionId': 'electionId',
      },
      ExpressionAttributeValues: {
        ':electionId': electionId,
      },
      KeyConditionExpression: '#electionId = :electionId',
      IndexName: this.electionnIdGSIName,
    });
  }

  async transactionVote(vote) {
    const {
      electionId,
      id,
      ballot,
    } = vote;

    const voteExists = !!(await this.get(id, { ConsistentRead: true }));
    const putItem = {
      Put: {
        TableName: this.tableName,
        Item: {
          ...vote,
          version: 1,
        },
        ConditionExpression: 'attribute_not_exists(id)',
      },
    };
    const updateItem = {
      Update: {
        TableName: this.tableName,
        Key: {
          id,
        },
        UpdateExpression: 'ADD #counter :increment SET #ballot = :ballot',
        ExpressionAttributeNames: {
          '#counter': 'version',
          '#ballot': 'ballot',
        },
        ExpressionAttributeValues: {
          ':increment': 1,
          ':ballot': ballot,
        },
      },
    };
    const params = {
      TransactItems: [
        voteExists ? updateItem : putItem,
        {
          Update: {
            TableName: process.env.DYNAMODB_ELECTION_TABLE,
            Key: {
              id: electionId,
            },
            ConditionExpression: '#status = :open',
            UpdateExpression: 'ADD #counter :increment',
            ExpressionAttributeNames: {
              '#counter': 'votesSentCount',
              '#status': 'status',
            },
            ExpressionAttributeValues: {
              ':increment': 1,
              ':open': 'OPEN',
            },
          },
        },
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
