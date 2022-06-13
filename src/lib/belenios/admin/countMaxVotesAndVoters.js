/**
 * Count the maximum number of voters and votes of an election.
 * Return the result.
 *
 * @param {Array.<{weight: Number}>} votersList
 * @returns {{maxVoters: Number, maxVotes: Number}}
 */

function countMaxVotesAndVoters(votersList) {
  const voters = JSON.parse(votersList);
  const maxVoters = voters.length;
  const maxVotes = voters.reduce(
    (weightAcc, { weight }) => weightAcc + weight,
    0,
  );
  return {
    maxVoters,
    maxVotes,
  };
}

export default countMaxVotesAndVoters;
