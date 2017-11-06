const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("answers query", () => {
  const answer = `
    query GetAnswers($ids: [ID]!) {
      answers(ids: $ids) {
        label
        id
      }
    }
  `;

  let repositories;
  const ids = ["1", "2", "3"];
  const answers = ids.map(id => ({ id, label: `Label${1}` }));

  beforeEach(() => {
    repositories = {
      Answer: mockRepository({
        findAll: answers
      })
    };
  });

  it("should fetch answers by id", async () => {
    const result = await executeQuery(answer, { ids }, { repositories });
    const { findAll } = repositories.Answer;

    expect(result.errors).toBeUndefined();
    expect(result.data.answers).toEqual(answers);
    expect(findAll).toHaveBeenCalledWith(expect.any(Function));

    // ensure correct knex methods are called
    const fn = findAll.mock.calls[0][0];
    const where = jest.fn();
    fn.call({ where });
    expect(where).toHaveBeenCalledWith("id", "in", ids);
  });
});
