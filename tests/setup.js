const fixtures = require("sequelize-fixtures");
const models = require("../models");

beforeEach(async () => {
  // clear db
  await models.sequelize.sync({ force : true });

  // seed db with test fixtures
  return fixtures.loadFile("tests/fixtures/data.json", models, {
    log : function() {}
  });
});