#!/bin/bash

set -e

yarn knex -- migrate:latest
yarn start
