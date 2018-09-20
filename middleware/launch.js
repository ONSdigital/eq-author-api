const { generateToken } = require("../utils/jwtHelper");
const { assign, isNil, isEmpty } = require("lodash");
const { sanitiseMetadata } = require("../utils/sanitiseMetadata");

module.exports = ctx => async (req, res, next) => {
  const questionnaireId = req.params.questionnaireId;
  const errors = [];

  const result = await ctx.repositories.Metadata.findAll({
    questionnaireId
  });

  const metadataValues = {};
  result.map(({ key, value, id }) => {
    if (isNil(key) || key.trim() === "") {
      errors.push(id);
    }
    return assign(metadataValues, { [key]: value });
  });

  if (!isEmpty(errors)) {
    next(
      new Error(
        `You have empty metadata keys, check your metadata and try again.`
      )
    );
  } else {
    const sanitisedMetadata = await sanitiseMetadata(
      metadataValues,
      questionnaireId
    );

    const jwt = await generateToken(sanitisedMetadata);

    res.redirect(`${process.env.RUNNER_SESSION_URL}${jwt}`);
  }
};
