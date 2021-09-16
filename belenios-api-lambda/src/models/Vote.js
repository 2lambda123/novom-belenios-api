import Model from './Model';

class VoteModel extends Model {
  constructor() {
    super(process.env.DYNAMODB_ELECTION_TABLE);
  }
}

export default VoteModel;
