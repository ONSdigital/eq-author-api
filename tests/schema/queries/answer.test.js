const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("answer query", () => {
  const answer = `
    query GetAnswer($id: Int!) {
      answer(id: $id) {
        id,
        description,
        guidance,
        label,
        mandatory,
        type,
        questionPage {
          id
        }
      }
    }
  `;

  let repositories;
  const id = 1;

  beforeEach(() => {
    repositories = {
      Answer: mockRepository()
    };
  });

  it("should fetch answer by id", async () => {
    const result = await executeQuery(answer, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Answer.get).toHaveBeenCalledWith(id);
  });
});
