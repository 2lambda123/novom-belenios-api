const { exec } = require('child_process');
const { writeFileSync } = require('fs');
const { default: ApiResponse } = require('./lib/ApiResponse');

function executeVote(privCred, ballot, electionDir) {
  return new Promise((resolve) => {
    exec(`bash ${__dirname}/scripts/vote.sh ${privCred} ${ballot} ${electionDir}`, (error, stdout) => {
      if (error) {
        resolve(new ApiResponse(500, JSON.stringify(error)));
      }
      resolve(new ApiResponse(200, JSON.stringify({ ballot: stdout })));
    });
  });
}

async function createBallot(event) {
  try {
    const {
      privCred,
      ballot,
      election,
      trustees,
    } = JSON.parse(event.body);

    const electionPath = '/tmp';
    const privCredFilePath = `${electionPath}/privCred`;
    const ballotFilePath = `${electionPath}/ballot`;
    const electionFilePath = `${electionPath}/election.json`;
    const trusteesFilePath = `${electionPath}/trustees.json`;

    writeFileSync(privCredFilePath, privCred);
    writeFileSync(ballotFilePath, ballot);
    writeFileSync(electionFilePath, election);
    writeFileSync(trusteesFilePath, trustees);

    return executeVote(privCredFilePath, ballotFilePath, electionPath);
  } catch (error) {
    return new ApiResponse(500, JSON.stringify(error));
  }
}

exports.handler = createBallot;
