# Belenios API

`master` is **unsafe**, please refer to tags.

An api wrapping the belenios-tool command line.

For more information about the Belenios voting system you can refer to this repository [Belenios](https://gitlab.inria.fr/belenios/belenios).

## Prerequisites

* [Node](https://nodejs.org) v14.16 (it is recommended to install it via [NVM](https://github.com/creationix/nvm))
* [Yarn](https://yarnpkg.com/)

## Getting Started

1. From the project root directory, run `yarn` to install dependencies.
2. Run `yarn setup`.
3. Run `yarn grant-access`.
4. Run `yarn start`.

## How To

### Run Tests

* Linter: `yarn test:lint`
* Unit Tests: `yarn test:unit`
* Both: `yarn test`

## Contributing

**Never** commit directly on master, instead use branches and pull requests.

Once approved, a Pull request is merged in `master` by its author. Also, it must be squashed before merging,
either manually or using GitHub's `Squash and merge` feature.

You must use the following Style Guides :

* [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

This project contains a linting config, you should setup `eslint` into your IDE with `.eslintrc.js`.

## Known Issues

Please refer to the [Issues](https://github.com/novom/belenios/issues) section
if you encounter any problems during development.

## API Actions

Take a look at 'belenios-api/src/examples/clients' to get started on Belenios API client creation.

### Admin

* **create-election**
  * Create an election.
  * Parameters:
    * callback : Callback function.
  * Returns:
    * status: Status of the action (`'FAILED' | 'OK'`)
    * payload: Id of the election.  ex: `'hP3Dv8r5PWszwB'`
    * error: Error message.
* **set-voters**
  * Set voters list.
  * Parameters:
    * callback : Callback function.
    * electionId: Id of the election.   ex: `'hP3Dv8r5PWszwB'`
    * voters: Voters list. ex: `[ { id: 'voter0', weight: 1 }, { id: 'voter2', weight: 1 }, ...]`
  * Returns:
    * status: Status of the action  (`'FAILED' | 'OK'`)
    * error: Error message.
* **verify-voters**
  * Get the voters list.
  * Parameters:
    * electionId: Id of the election.  ex: `'hP3Dv8r5PWszwB'`
    * callback : Callback function.
  * Returns:
    * status: Status of the action (`'FAILED' | 'OK'`)
    * payload: Voters list. ex: `[ { id: 'voter0', weight: 1 }, { id: 'voter2', weight: 1 }, ...]`
    * error: Error message.
* **get-voters-count**
  * Get number of connected voters to the election.
  * Parameters:
    * electionId: Id of the election.   ex: `'hP3Dv8r5PWszwB'`
    * callback : Callback function.
  * Returns:
    * status: Status of the action (`'FAILED' | 'OK'`)
    * payload: Number of voters.
    * error: Error message.
* **lock-voters**
  * Lock voters list for an election.
  * Parameters:
    * electionId: Id of the election.   ex: `'hP3Dv8r5PWszwB'`
    * callback : Callback function.
  * Returns:
    * status: Status of the action (`'FAILED' | 'OK'`)
    * error: Error message.
* **make-election**
  * Open an election.
    * Parameters:
    * callback : Callback function.  ex: `'hP3Dv8r5PWszwB'`
    * electionId: Id of the election.  
  * Returns:
    * status: Status of the action  (`'FAILED' | 'OK'`)
    * error: Error message.
* **compute-voters**
  * Give the number of voters and the number of votes for an election.
  * Parameters:
    * electionId: Id of the election.   ex: `'hP3Dv8r5PWszwB'`
    * callback : Callback function.
  * Returns:
    * status: Status of the action (`'FAILED' | 'OK'`)  
    * payload:
      * nbVoters: Number of voters.
      * nbVotes: Number of votes including the weight of each votes.
  * error: Error message.
* **close-election**
  * Close an election and return results.
  * Parameters:
    * electionId : Id of the election.   ex: `'hP3Dv8r5PWszwB'`
    * callback : Callback function.
  * Returns:
    * status: Status of the action  (`'FAILED' | 'OK'`)  
    * payload: Results of the election.
    * error: Error message.
* **delete-election**
  * Delete all related data to an election.
  * Parameters:
    * electionId : Id of the election.   ex: `'hP3Dv8r5PWszwB'`
    * callback : Callback function.
  * Returns:
    * status: Status of the action  (`'FAILED' | 'OK'`)  
    * payload: Id of the election.
    * error: Error message.

### Voter

* **join-election**
  * Join an election.
  * Parameters:
    * electionId : Id of the election.   ex: `'hP3Dv8r5PWszwB'`
    * userId : Id of the voter.   ex: `'voter1'`
    * callback : Callback function.
  * Returns:
    * status: Status of the action  (`'FAILED' | 'OK'`)
    * payload:
      * election: Election information.
      * trustees: Trustees information.
      * privCred: Private credential of the voter for this election.
    * error: Error message.
* **vote**
  * Add a ballot to an election.
  * Parameters:
    * electionId : Id of the election.   ex: `'hP3Dv8r5PWszwB'`
    * callback : Callback function.
  * Returns:
    * status: Status of the action  (`'FAILED' | 'OK'`)
    * ballot : Election ballot.
    * error: Error message.
* **encrypted-vote**
  * Add a encrypted ballot to an election.
  * Parameters:
    * electionId : Id of the election.   ex: `'hP3Dv8r5PWszwB'`
    * ballot : Encrypted election ballot.
    * callback : Callback function.
  * Returns:
    * status: Status of the action  (`'FAILED' | 'OK'`)  
    * error: Error message.
