# Sructure

Belenios API id designed to be deploy on AWS services. Here a small diagram to present each part. 

![Belenios Lambda](https://user-images.githubusercontent.com/26386976/173422180-7c79aa7f-1205-4d76-beaf-3a9c6aa299e2.png)


# Auth

In order to interact with the api the client can authenticate with two possible roles witch is voter or administrator.

|                     | Voter | Admin |
|---------------------|-------|-------|
| getElection         |  ✅  |  ✅   |
| getElections        |  ✅  |  ✅   |
| getAllElectionVotes |  ✅  |  ✅   |
| openElection        |  ✅  |  ✅   |
| vote                |  ✅  |  ✅   |
| joinElection        |  ✅  |  ✅   |
| openElection        |  ✅  |       |
| closeElection       |  ✅  |       |
| computeVoters       |  ✅  |       |

To configure the authentication you need to set a secret key and an algorithm. [setting files](https://github.com/novom/belenios-api/tree/main/src/settings)

Example:
```json
  "authorization": {
    "jwt": {
      "secretKey": "0f5bab7eeb5511ec8ea00242ac120002",
      "algorithm": "HS256"
    }
  }
```

After that you only have to generate a token with the same secret key and add it to the header of your request.

Example: 
