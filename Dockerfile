FROM node:8
EXPOSE 4000
ENV PORT=4000
WORKDIR /app

ARG APPLICATION_VERSION
ENV EQ_AUTHOR_API_VERSION $APPLICATION_VERSION
ENV NODE_ENV production

ENTRYPOINT ["yarn", "start"]

COPY . /app
RUN yarn install
RUN yarn upgrade eq-author-graphql-schema
