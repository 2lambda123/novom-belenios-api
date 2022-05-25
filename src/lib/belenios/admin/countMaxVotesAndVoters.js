function countMaxVotesAndVoters(votersList) {
  const voters = votersList;
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
