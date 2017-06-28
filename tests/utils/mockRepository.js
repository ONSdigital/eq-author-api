module.exports = function mockRepository() {
  return {
    get : jest.fn(),
    findAll : jest.fn(),
    insert : jest.fn(),
    update : jest.fn(),
    remove : jest.fn()
  };
}