# eq-author-api

A GraphQL based API for the [eq-author](https://github.com/ONSdigital/eq-author)
application.

## Installation

### Configuration

Environment variables can be used to configure various aspects of the API.
In most cases sensible defaults have been selected.

> **Tip**
>
> If you decide to run the Author API directly using `yarn` you will need to
> ensure that a suitable database instance is running and configure the
> associated database environment variables appropriately.
>
> Running using `docker-compose` will ensure that a suitable postgres instance
> is started. So there is no need to configure the environment variables.

| Environment Variable | Description |
| -------------------- | ----------- |
| PORT                 | The port which express listens on (defaults to `4000`). |
| DB_CONNECTION_URI    | Connection string for database |

### Run using Docker

To build and run the Author GraphQL API inside a docker container, ensure that
Docker is installed for your platform, navigate to the project directory, then run:

Build the docker image (1st time run):
```
docker-compose build
```

```
docker-compose up
```

Once the containers are running you should be able to navigate to http://localhost:4000/graphiql and begin exploring the eQ Author GraphQL API.

Changes to the application should hot reload via `nodemon`.

## Usage

### Querying the API

![querying the API](./doc/images/query.gif)

### Mutating state using the API

![mutating state using the API](./doc/images/mutation.gif)

### Browsing the API documentation

![browsing the API documentation](./doc/images/docs.gif)

### Querying pages

There is no concrete `Page` type in the GraphQL schema. Instead we use a `Page` interface, which other types implement e.g. `QuestionPage` and `InterstitialPage`.

To query all pages, and request different fields depending on the type, use [inline fragments](http://graphql.org/learn/queries/#inline-fragments):

```gql
query {
  getQuestionnaire(id: 1) {
    questionnaire {
      sections {
        pages {
          id,

          # inline fragment for `QuestionPage` type
          ... on QuestionPage {
            guidance,
            answers {
              id,
              label
            }
          },

          # For purposes of example only. `InterstitialPage` doesn't exist yet
          ... on InterstitialPage { # doesn't exist yet
            someField
          }

        }
      }
    }
  }
}
```

### Testing through GraphiQL

There are [queries](tests/fixtures/queries.gql) and [example data](tests/fixtures/data.json) in the [fixtures folder](tests/fixtures). These can be used with graphiql to manually build up a questionnaire.

### DB migrations

First start app using Docker.

#### Create migration

```
yarn knex -- migrate:make name_of_migration
```

Where `name_of_migration` is the name you wish to use. e.g. `create_questionnaires_table`

#### Apply migrations

```
docker-compose exec web yarn knex -- migrate:latest
```

#### Rollback migrations

```
docker-compose exec web yarn knex -- migrate:rollback
```

## Tests

`yarn test` will start a single run of unit and integration tests.

`yarn test --watch` will start unit and integration tests in watch mode.

## Debugging (with VS Code)

### Debugging app

Follow [this guide](https://github.com/docker/labs/blob/83514855aff21eaed3925d1fd28091b23de0e147/developer-tools/nodejs-debugging/VSCode-README.md) to enable debugging through VS Code. 

Use this config for VS Code, rather than what is detailed in the guide. This will attach *to the running docker container*:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to Container",
      "type": "node",
      "request": "attach",
      "port": 5858,
      "address": "localhost",
      "restart": true,
      "sourceMaps": false,
      "localRoot": "${workspaceRoot}",
      "remoteRoot": "/app",
      "protocol": "inspector"
    }
  ]
}
```

### Debugging tests

Add the following to your `launch.json` configuration:

```json
{
  "name": "Attach by Process ID",
  "type": "node",
  "request": "attach",
  "processId": "${command:PickProcess}"
}
```

Then start your tests [as described above](#tests). You can now start a debugging session, and pick the jest process to attach to.