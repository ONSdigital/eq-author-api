/* eslint-disable no-console */
const express = require("express");
const { graphqlExpress, graphiqlExpress } = require("graphql-server-express");
const { addErrorLoggingToSchema } = require("graphql-tools");
const repositories = require("./repositories");
const colors = require("colors");
const cors = require("cors");
const bodyParser = require("body-parser");
const schema = require("./schema");
const pinoMiddleware = require("express-pino-logger");
const { PORT } = require("./config/settings");
const createLogger = require("./utils/createLogger");
const status = require("./middleware/status");

const app = express();
const pino = pinoMiddleware();
const logger = createLogger(pino.logger);

addErrorLoggingToSchema(schema, logger);
app.use(pino);

app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  graphqlExpress({
    schema,
    context: { repositories },
    formatError: logger.log
  })
);

app.get("/status", status);

if (process.env.NODE_ENV === "development") {
  app.use("/graphiql", cors(), graphiqlExpress({ endpointURL: "/graphql" }));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(colors.green("Listening on port"), PORT);
});
