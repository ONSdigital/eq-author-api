const { omit, head, get, isNil } = require("lodash");
const {
  getOrUpdateOrderForPageInsert,
  getOrUpdateOrderForSectionInsert
} = require("../spacedOrderStrategy");

const insertData = async (
  trx,
  tableName,
  data,
  callback,
  returning = "*",
  position
) => {
  const returnedData = await trx
    .table(tableName)
    .insert(data)
    .returning(returning)
    .then(callback);

  if (returnedData.order) {
    let updateOrder = getOrUpdateOrderForPageInsert;
    let parentId = returnedData.sectionId;
    if (tableName === "Sections") {
      updateOrder = getOrUpdateOrderForSectionInsert;
      parentId = returnedData.questionnaireId;
    }
    const order = await updateOrder(trx, parentId, returnedData.id, position);

    await trx
      .table(tableName)
      .update({ order })
      .where({ id: returnedData.id });
  }

  return returnedData;
};

const selectData = (trx, tableName, columns, where, orderBy) => {
  const queryP = trx
    .select(columns)
    .from(tableName)
    .where(where);
  if (orderBy) {
    const { column, direction } = orderBy;
    queryP.orderBy(column, direction);
  }
  return queryP;
};

const duplicateRecord = async (
  trx,
  tableName,
  record,
  overrides = {},
  position
) => {
  const duplicatedRecord = omit(record, "id", "createdAt", "updatedAt");
  const { parentRelation, ...other } = overrides;

  if (!isNil(parentRelation)) {
    duplicatedRecord[get(parentRelation, "columnName")] = get(
      parentRelation,
      "id"
    );
  }

  const newRecord = { ...duplicatedRecord, ...other };

  return insertData(trx, tableName, newRecord, head, "*", position);
};

module.exports = {
  insertData,
  selectData,
  duplicateRecord
};
