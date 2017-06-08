const models = require("../models");
const { attributeFields, resolver } = require("graphql-sequelize");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} = require("graphql");

const Question = new GraphQLObjectType({
  name : "Question",
  description: "A question",
  fields: attributeFields(models.Question)
});

const Page = new GraphQLObjectType({
  name : "Page",
  description : "A page",
  fields : Object.assign(attributeFields(models.Page), {
    questions : {
      type: new GraphQLList(Question),
      resolve: resolver(models.Page.Questions)
    }
  })
});

const Questionnaire = new GraphQLObjectType({
  name : "Questionnaire",
  description : "A Questionnaire",
  fields: Object.assign(attributeFields(models.Questionnaire), {
    pages : {
      type : new GraphQLList(Page),
      resolve: resolver(models.Questionnaire.Pages)
    }
  })
});

// Define a root query.
// Think of this as public API for querying

const query = new GraphQLObjectType({
  name: 'Query',
  description: 'This is the root query',

  fields: {
    questionnaires : {
      type : new GraphQLList(Questionnaire),
      resolve: resolver(models.Questionnaire)
    },

    questionnaire : {
      type: Questionnaire,
      args : {
        id : {
          type : new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: resolver(models.Questionnaire)
    },

    page : {
      type: Page,
      args : {
        id : {
          type : new GraphQLNonNull(GraphQLID)
        }
      },
      resolve : resolver(models.Page)
    },

    question : {
      type: Question,
      args : {
        id : {
          type : new GraphQLNonNull(GraphQLID)
        }
      },
      resolve : resolver(models.Question)
    }
  }
});

// Define a root mutation.
// Think of this as public API for mutation
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Functions to mutate stuff',
  fields: {
    createQuestionnaire: {
      type: Questionnaire,

      args : {
        title : {
          type : new GraphQLNonNull(GraphQLString)
        },
        description : {
          type : new GraphQLNonNull(GraphQLString)
        },
        theme : {
          type : new GraphQLNonNull(GraphQLString)
        },
        legalBasis : {
          type : new GraphQLNonNull(GraphQLString)
        },
        navigation : {
          type : GraphQLBoolean
        }
      },

      resolve(source, { title, description, theme, legalBasis, navigation }) {
        return models.Questionnaire.create({
          title,
          description,
          theme,
          legalBasis,
          navigation
        });
      }
    },

    createPage: {
      type: Page,

      args : {
        title : {
          type : new GraphQLNonNull(GraphQLString)
        },
        description : {
          type : new GraphQLNonNull(GraphQLString)
        },
        questionnaireId : {
          type : GraphQLID
        }
      },

      resolve(source, { title, description, questionnaireId }) {
        return models.Page.create({
          title,
          description,
          QuestionnaireId : questionnaireId
        });
      }
    },

    createQuestion: {
      type: Question,

      args : {
        title : {
          type : new GraphQLNonNull(GraphQLString)
        },
        description : {
          type : new GraphQLNonNull(GraphQLString)
        },
        guidance : {
          type : new GraphQLNonNull(GraphQLString)
        },
        type : {
          type : GraphQLString
        },
        mandatory : {
          type : GraphQLBoolean
        },
        pageId : {
          type : GraphQLID
        }
      },

      resolve(source, { title, description, guidance, type, mandatory, pageId }) {
        return models.Question.create({
          title,
          description,
          guidance,
          type,
          mandatory,
          PageId : pageId
        });
      }
    }
  }
});

/**
* This is where all the GraphQL schema types will be defined.
* The finished schema is likely to include things like Pages, Questions, Answers etc.
*/
const schema = new GraphQLSchema({
  query,
  mutation
});

// Export the schema
module.exports = schema;
