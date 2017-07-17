module.exports = function mockRepository(returnValues = {}) {
  return {
    get: jest.fn(() => returnValues.get),
    findAll: jest.fn(() => returnValues.findAll),
    insert: jest.fn(() => returnValues.insert),
    update: jest.fn(() => returnValues.update),
    remove: jest.fn(() => returnValues.remove)
  };
};
