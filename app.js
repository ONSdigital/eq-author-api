const express = require("express");
const { graphqlExpress, graphiqlExpress } = require("graphql-server-express");
const repositories = require("./repositories");
const colors = require("colors");
const cors = require("cors");
const bodyParser = require("body-parser");
const schema = require("./schema");
const morgan = require("morgan");

const { PORT } = require("./config/settings");

const app = express();
app.use(morgan("tiny"));

app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  graphqlExpress({ schema: schema, context: { repositories: repositories } })
);

if (process.env.NODE_ENV === "development") {
  app.use("/graphiql", cors(), graphiqlExpress({ endpointURL: "/graphql" }));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(colors.green("Listening on port"), PORT); // eslint-disable-line
});
