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
      questionPageId: "1"
    };

    const repoInput = {
      ...input,
      properties: {
        required: false
      }
    };

    const result = await executeQuery(
      createAnswer,
      { input },
      { repositories }
    );

    expect(result.errors).toBeUndefined();
    expect(repositories.Answer.insert).toHaveBeenCalledWith(repoInput);
  });

  describe("answer types", () => {
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
          questionPageId: "1"
        }
      };
    };

    describe("number answers", () => {
      it("should add default properties", async () => {
        const fixture = createFixture("Number");

        const result = await executeQuery(createAnswer, fixture, {
          repositories
        });

        const expectedInput = {
          description: "Test answer description",
          guidance: "Test answer guidance",
          type: "Number",
          questionPageId: "1",
          properties: {
            required: false,
            decimals: 0
          }
        };

        expect(result.errors).toBeUndefined();
        expect(repositories.Answer.insert).toHaveBeenCalledWith(expectedInput);
      });
    });

    describe("multiple choice answers", () => {
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
});
