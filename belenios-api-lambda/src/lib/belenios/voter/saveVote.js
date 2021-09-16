import fs from 'fs';

function saveVote(voteBallot, ballotFilePath) {
  const publicKey = voteBallot.signature.public_key;

  if (!fs.existsSync(ballotFilePath)) {
    fs.writeFileSync(ballotFilePath, '');
  }

  if (publicKey) {
    const ballots = fs.readFileSync(ballotFilePath);

    if (ballots.includes(publicKey)) {
      const newBallots = ballots
        .toString()
        .split('\n')
        .map((line) => (line && line.includes(publicKey) ? JSON.stringify(voteBallot) : line))
        .join('\n');
      fs.writeFileSync(ballotFilePath, newBallots);
    } else {
      fs.appendFileSync(ballotFilePath, `${JSON.stringify(voteBallot)}\n`);
    }

    return true;
  }
  return false;
}

export default saveVote;
