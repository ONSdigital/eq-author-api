const fixtures = require("sequelize-fixtures");
const models = require("../models");

// TODO: find out why getting warnings about too many event listeners

// This wraps the on() method to log args, might help diagnose
// const actualOn = EventEmitter.prototype.on;
// EventEmitter.prototype.on = function() {
//   console.trace("adding event listener", arguments);
//   return actualOn.apply(this, arguments);
// };

// This prints stack trace when the warning is logged
// process.on('warning', (warning) => {
//   console.warn(warning.name);    // Print the warning name
//   console.warn(warning.message); // Print the warning message
//   console.warn(warning.stack);   // Print the stack trace
// });

beforeEach(async () => {
  // clear db
  await models.sequelize.sync({ force : true });

  // seed db with test fixtures
  return fixtures.loadFile("tests/fixtures/data.json", models, {
    log : function() {}
  });
});