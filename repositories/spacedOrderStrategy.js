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

const getAdjacentRows = (trx, sectionId, position) => {
  return trx("Pages")
    .columns("id", "order")
    .where({
      SectionId: sectionId,
      isDeleted: false
    })
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

  let rows = await getAdjacentRows(trx, sectionId, position);

  // position > number of rows, then we need to get max current value
  if (rows.length === 0) {
    const [{ order }] = await getNextOrderValue(trx, sectionId);
    rows = [order, order + SPACING];
  }
  // inserting at end of list
  if (rows.length === 1) {
    rows = [rows[0], rows[0] + SPACING];
  }
  // inserting at start of list
  if (position === 0) {
    rows = [0, rows[0]];
  }

  // make some space in case where "order" values have converged
  if (valuesHaveConverged(...rows)) {
    await makeSpaceAfter(trx, rows[0], sectionId);
    rows[1] += SPACING;
  }

  const [page] = await setOrder(trx, id, sectionId, calculateMidPoint(...rows));
  return Object.assign(page, { position });
};

module.exports = {
  getNextOrderValue,
  movePage
};
