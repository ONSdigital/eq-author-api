#!/bin/bash

yarn knex -- migrate:latest
yarn start
