/* eslint-disable no-console */
const express = require("express");
const { graphqlExpress, graphiqlExpress } = require("graphql-server-express");
const { addErrorLoggingToSchema } = require("graphql-tools");
const repositories = require("./repositories");
const colors = require("colors");
const cors = require("cors");
const bodyParser = require("body-parser");
const schema = require("./schema");
const pino = require("express-pino-logger")();
const { PORT } = require("./config/settings");

const app = express();

app.use(pino);

const logger = {
  log: error => {
    console.error(error);
    return error;
  }
};

const withErrorLogging = schema => {
  addErrorLoggingToSchema(schema, logger);
  return schema;
};

app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  graphqlExpress({
    schema: withErrorLogging(schema),
    context: { repositories },
    formatError: logger.log
  })
);

if (process.env.NODE_ENV === "development") {
  app.use("/graphiql", cors(), graphiqlExpress({ endpointURL: "/graphql" }));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(colors.green("Listening on port"), PORT);
});
