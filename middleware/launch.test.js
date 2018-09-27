const getLaunchUrl = require("./launch");
const mockRepository = require("../tests/utils/mockRepository");

let repositories;
const QUESTIONNAIRE_ID = 1;

describe("launcher middleware", () => {
  let res;
  let req = { params: { questionnaireId: QUESTIONNAIRE_ID } };
  res = {
    redirect: jest.fn()
  };
  let next = jest.fn();

  repositories = {
    Metadata: mockRepository({
      findAll: [{ id: 1, key: "hello", type: "Text", value: "hello" }]
    })
  };

  it("should find all metadata when the endpoint is hit", async () => {
    const ctx = { repositories };
    await getLaunchUrl(ctx)(req, res, next);

    expect(repositories.Metadata.findAll).toHaveBeenCalledWith({
      questionnaireId: QUESTIONNAIRE_ID
    });
  });

  it("should call a redirect with a jwt", async () => {
    const ctx = { repositories };
    await getLaunchUrl(ctx)(req, res, next);

    expect(res.redirect).toHaveBeenCalled();
  });

  it("should call next with an error if a metadata is missing a key", async () => {
    const ctx = {
      repositories: {
        Metadata: mockRepository({
          findAll: [{ id: 1, type: "Text", value: "hello" }]
        })
      }
    };
    await getLaunchUrl(ctx)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should call next with an error if metadata key is null", async () => {
    const ctx = {
      repositories: {
        Metadata: mockRepository({
          findAll: [{ id: 1, key: null, type: "Text", value: "hello" }]
        })
      }
    };
    await getLaunchUrl(ctx)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should call next with an error if metadata key is an empty string", async () => {
    const ctx = {
      repositories: {
        Metadata: mockRepository({
          findAll: [{ id: 1, key: "", type: "Text", value: "hello" }]
        })
      }
    };
    await getLaunchUrl(ctx)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should call next with an error if metadata key is a string of whitespaces", async () => {
    const ctx = {
      repositories: {
        Metadata: mockRepository({
          findAll: [{ id: 1, key: "    ", type: "Text", value: "hello" }]
        })
      }
    };
    await getLaunchUrl(ctx)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
