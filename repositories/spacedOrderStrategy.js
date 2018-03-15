const { map } = require("lodash");

const SPACING = 1000;

const calculateMidPoint = (orderBefore, orderAfter) =>
  Math.round((orderBefore + orderAfter) / 2);

const valuesHaveConverged = (orderBefore, orderAfter) =>
  Math.abs(orderAfter - orderBefore) < 2;

const getNextOrderValue = (trx, SectionId) => {
  return trx("Pages")
    .column(trx.raw(`COALESCE(max("order"), 0) + ${SPACING} as "order"`))
    .where({ SectionId, isDeleted: false });
};

const setOrder = (trx, id, SectionId, order) => {
  return trx("Pages")
    .where({ id })
    .update({ order, SectionId })
    .returning("*");
};

const getAdjacentRows = (trx, id, sectionId, position) => {
  return trx("Pages")
    .columns("id", "order")
    .where({
      SectionId: sectionId,
      isDeleted: false
    })
    .where("id", "!=", id)
    .orderBy("order")
    .offset(Math.max(0, position - 1))
    .limit(2)
    .then(result => map(result, "order"));
};

const makeSpaceAfter = (trx, order, SectionId) => {
  return trx("Pages")
    .where({ SectionId })
    .andWhere("order", ">", order)
    .increment("order", SPACING);
};

const movePage = async (trx, { id, sectionId, position }) => {
  position = Math.max(0, position);

  let rows = await getAdjacentRows(trx, id, sectionId, position);

  // there are two cases in which there are no adjacent rows
  // 1. inserting into empty list
  // 2. inserting at position beyond end of list (e.g. inserting at position 10, where only 10 items in list)
  if (rows.length === 0) {
    const [{ order }] = await getNextOrderValue(trx, sectionId);
    rows = [order, order + SPACING];
  }

  if (position === 0) {
    // inserting at start of list, there is no actual left-hand value
    rows = [0, rows[0]];
  } else if (rows.length === 1) {
    // inserting at end of list, there is no actual right-hand value
    rows = [rows[0], rows[0] + SPACING];
  }

  if (valuesHaveConverged(...rows)) {
    await makeSpaceAfter(trx, rows[0], sectionId);
    // now that space has been made for insertion, bring local data up to date
    rows[1] += SPACING;
  }

  const [page] = await setOrder(trx, id, sectionId, calculateMidPoint(...rows));

  // assign position to the page object, so that data can be resolved locally by graphql
  return Object.assign(page, { position });
};

module.exports = {
  getNextOrderValue,
  movePage
};
