const cheerio = require("cheerio");

const updatePiping = (field, references) => {
  if (!field || field.indexOf("<span") === -1) {
    return field;
  }

  const $ = cheerio.load(field);

  $("span").map((i, el) => {
    const $el = $(el);
    const pipeType = $el.data("piped");
    const id = $el.data("id");

    const newId = references[pipeType][id];

    // Can't use data as it doesn't work
    // https://github.com/cheeriojs/cheerio/issues/1240
    $el.attr("data-id", newId);

    return $.html($el);
  });

  return $("body").html();
};

module.exports = updatePiping;
