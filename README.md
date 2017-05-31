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
| SCHEME               | `http://` or `https://` (defaults to `http://`) |
| GRAPHIQL_ENABLED     | Enable the Graphiql interface (`true` or `false`) |
| GRAPHIQL_ENDPOINT    | The endpoint which graphiql listens on (defaults to `/graphiql`) |
| PRETTY_PRINT_GRAPHQL | Pretty print Graphiql output (`true` or `false`) |
| DATABASE             | Database name |
| DATABASE_USERNAME    | Username of database user. |
| DATABASE_PASSWORD    | Password of database user. |
| DB_HOST              | Hostname of database server. |
| DB_DIALECT           | Database dialect (e.g. `postgres`, `mysql`, `sqlite`) |

### Run using Yarn

To install the dependencies, simply run:
```
yarn
```

To start the author API backend, run:
```
yarn start
```

### Run using Docker

To build and run the Author GraphQL API inside a docker container, ensure that
Docker is installed for your platform, navigate to the project directory, then run:

```
docker-compose up -d
```

Once the containers are running you should be able to navigate to http://localhost:4000/graphiql and begin exploring the eQ Author GraphQL API.

## Usage

### Querying the API

![querying the API](./doc/images/query.gif)

### Mutating state using the API

![mutating state using the API](./doc/images/mutation.gif)

### Browsing the API documentation

![browsing the API documentation](./doc/images/docs.gif)
