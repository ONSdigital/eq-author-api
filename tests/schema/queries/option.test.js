const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("option query", () => {
  const option = `
    query GetOption($id: ID!) {
      option(id: $id) {
        id,
        description
      }
    }
  `;

  const optionWithAnswer = `
    query GetOption($id: ID!) {
      option(id: $id) {
        id,
        answer {
          id
        }
      }
    }
  `;

  let repositories;
  const id = "1";
  const answerId = "2";

  beforeEach(() => {
    repositories = {
      Option: mockRepository({
        get: {
          id,
          answerId
        }
      }),
      Answer: mockRepository()
    };
  });

  it("should fetch option by id", async () => {
    const result = await executeQuery(option, { id }, { repositories });

    expect(result.errors).toBeUndefined();
    expect(repositories.Option.get).toHaveBeenCalledWith(id);
  });

  it("should have an association with Answer", async () => {
    const result = await executeQuery(
      optionWithAnswer,
      { id },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Option.get).toHaveBeenCalledWith(id);
    expect(repositories.Answer.getById).toHaveBeenCalledWith(answerId);
  });
});
