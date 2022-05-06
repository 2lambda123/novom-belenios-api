import ElectionModel from './Election';
import UserModel from './User';
import VoteModel from './Vote';

const Election = new ElectionModel();
const Vote = new VoteModel();
const User = new UserModel();

export { Election, Vote, User };
