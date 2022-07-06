# Belenios API

`master` is **unsafe**, please refer to tags.

An api wrapping the belenios-tool command line.

For more information about the Belenios voting system you can refer to this repository [Belenios](https://gitlab.inria.fr/belenios/belenios).

## Prerequisites

* An Amazon Web Services (AWS) account.
* [Node](https://nodejs.org) v14.16 (it is recommended to install it via [NVM](https://github.com/creationix/nvm))
* [Yarn](https://yarnpkg.com/)

## Getting Started

1. From the project root directory, run `yarn` to install dependencies.
2. Add `.../dependencies/belenios/_build/install/default/bin` to path environment variable.

## How To

### Run Tests

* Linter: `yarn test:lint`
* Unit Tests: `yarn test:unit`
* Both: `yarn test`

### Deploy

1. Create a copy of each {stage}.sample.js files to {stage}.sample.js.
2. Enter the missing information in the setting files.
3. Run command:

* In development: `yarn deploy {yourPersonalStage}`
* In demo: `yarn deploy:demo`
* In staging: `yarn deploy:staging`
* In production: `yarn deploy:production`

### undeploy

* In development: `yarn undeploy {yourPersonalStage}`
* In demo: `yarn undeploy:demo`
* In staging: `yarn undeploy:staging`
* In production: `yarn undeploy:production`

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

## Documentation

### Technical documentation
For technical documentation refer to [doc](https://github.com/novom/belenios-api/tree/add-doc/doc) folder.

### API documentation
Once deploy you can go directly to the endpoint and the Apollo Studio will automatically show the latest API doc in pair with a playground. 
