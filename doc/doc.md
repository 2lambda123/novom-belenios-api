
# Documentation
## Sructure

Belenios API is designed to be hosted on AWS services. Here is a small diagram showing the structure of the service:

![Belenios Lambda](https://user-images.githubusercontent.com/26386976/173422180-7c79aa7f-1205-4d76-beaf-3a9c6aa299e2.png)

## Auth

The Belenios API use [JWT](https://jwt.io/) authentication to secure the endpoint.

### Access roles
|                           | Voter | Admin |
|---------------------------|-------|-------|
| getElection               |  ✅  |  ✅   |
| getAllElectionWithParent  |  ✅  |  ✅   |
| getAllElectionVotes       |  ✅  |  ✅   |
| openElection              |  ✅  |  ✅   |
| vote                      |  ✅  |  ✅   |
| joinElection              |  ✅  |  ✅   |
| openElection              |  ✅  |       |
| closeElection             |  ✅  |       |
| computeVoters             |  ✅  |       |

### Configuration

To configure the authentication you need to set a secret key and an algorithm in the [setting file](https://github.com/novom/belenios-api/tree/main/src/settings).

Example:
```json
  "authorization": {
    "jwt": {
      "secretKey": "<Secret key>",
      "algorithm": "<Algorithm>"
    }
  }
```

After that you only have to generate a token with the same secret key and add it to the header of your request.

Example of a jwt payload: 
```json
{
  "extraPayload": {
    "accessRole": "admin"
  }
  ...
}
```

Example of a request header:
```js
headers: {
  "Authorization": "Bearer <Generated JWT>"
  ...
}
```
