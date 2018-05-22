const {
  isEmpty,
  flow,
  last,
  clamp,
  getOr,
  isNil,
  reject
} = require("lodash/fp");

const SPACING = 1000;

const calculateMidPoint = (a, b) => Math.round((a + b) / 2);

const valuesHaveConverged = (orderBefore, orderAfter) =>
  Math.abs(orderAfter - orderBefore) < 2;

const makeSpaceForInsert = (trx, SectionId, order) =>
  trx("Pages")
    .where({ SectionId })
    .andWhere("order", ">", order)
    .increment("order", SPACING);

const getPagesBySection = (trx, SectionId) =>
  trx("PagesView")
    .columns("id", "order")
    .where({ SectionId })
    .orderBy("order");

const getMaxOrder = flow(last, getOr(0, "order"));

const getOrUpdateOrderForInsert = async (trx, sectionId, id, position) => {
  const pages = reject({ id }, await getPagesBySection(trx, sectionId));
  const maxOrder = getMaxOrder(pages) + SPACING;

  position = isNil(position) ? pages.length : clamp(0, pages.length, position);

  if (isEmpty(pages)) {
    return SPACING;
  }
  if (position === pages.length) {
    return maxOrder;
  }

  let left = getOr(0, "order", pages[position - 1]);
  let right = getOr(maxOrder, "order", pages[position]);

  if (valuesHaveConverged(left, right)) {
    await makeSpaceForInsert(trx, sectionId, left);
    right += SPACING;
  }

  return calculateMidPoint(left, right);
};

module.exports = {
  getOrUpdateOrderForInsert
};
