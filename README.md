# eq-author-api

A GraphQL based API for the [eq-author](https://github.com/ONSdigital/eq-author)
application.

## Installation

To install the dependencies, simply run:
```
yarn install
```

## Running the app

### Using yarn

```
yarn start
```

### Using Docker

Build the docker image:

```
docker build -t eq-author-api:latest .
```

Run the docker container:

```
docker run -it -d -p 4000:4000 eq-author-api
```
