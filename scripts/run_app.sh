#!/bin/bash

yarn install
DB_CONNECTION_URI=postgres://postgres:mysecretpassword@db:5432/postgres yarn knex -- migrate:latest
yarn start
