import Model from './Model';

class VoteModel extends Model {
  constructor() {
    super(process.env.DYNAMODB_VOTE_TABLE);
  }
}

export default VoteModel;
