import Model from './Model';

class ElectionModel extends Model {
  constructor() {
    super(process.env.DYNAMODB_ELECTION_TABLE);
  }
}

export default ElectionModel;
