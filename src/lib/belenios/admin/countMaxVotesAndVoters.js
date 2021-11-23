function countMaxVotesAndVoters(votersList) {
  const voters = JSON.parse(votersList);
  const maxVoters = voters.length;
  const maxVotes = voters.map(({ weight }) => weight).reduce(
    (weightAcc, weight) => weightAcc + weight,
  );
  return {
    maxVoters,
    maxVotes,
  };
}

export default countMaxVotesAndVoters;
