const executeQuery = require("../../utils/executeQuery");
const mockRepository = require("../../utils/mockRepository");

describe("createAnswer", () => {
  const createAnswer = `
    mutation CreateAnswer($input: CreateAnswerInput!) {
      createAnswer(input: $input) {
        id,
        description,
        guidance,
        qCode,
        label,
        type,
        mandatory
        ... on MultipleChoiceAnswer {
          options {
            id
          }
        }
      }
    }
  `;

  let repositories;

  beforeEach(() => {
    repositories = {
      Answer: mockRepository({
        insert: {
          id: "1",
          type: "TextField",
          page: {
            id: "1"
          }
        }
      })
    };
  });

  it("should allow creation of Answer", async () => {
    const input = {
      description: "Test answer description",
      guidance: "Test answer guidance",
      type: "TextField",
      mandatory: false,
      questionPageId: "1"
    };

    const result = await executeQuery(
      createAnswer,
      { input },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Answer.insert).toHaveBeenCalledWith(input);
  });

  describe("multiple choice answers", () => {
    let repositories;

    beforeEach(() => {
      repositories = {
        Option: mockRepository({
          insert: {
            type: "Option"
          }
        })
      };
    });

    const createFixture = answerType => {
      repositories.Answer = mockRepository({
        insert: {
          id: "1",
          type: answerType,
          questionPageId: "1"
        }
      });
      return {
        input: {
          description: "Test answer description",
          guidance: "Test answer guidance",
          type: answerType,
          mandatory: false,
          questionPageId: "1"
        }
      };
    };

    it("should add a single default option for checkbox answers", async () => {
      const fixture = createFixture("Checkbox");

      const result = await executeQuery(createAnswer, fixture, {
        repositories
      });

      expect(result.errors).toBeUndefined();
      expect(repositories.Option.insert).toHaveBeenCalledTimes(1);
    });

    it("should create two default options for radio answers", async () => {
      const fixture = createFixture("Radio");

      const result = await executeQuery(createAnswer, fixture, {
        repositories
      });

      expect(result.errors).toBeUndefined();
      expect(repositories.Option.insert).toHaveBeenCalledTimes(2);
    });
  });
});
