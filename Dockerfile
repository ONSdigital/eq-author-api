FROM node:8
EXPOSE 4000
ENV PORT=4000
WORKDIR /app

ENTRYPOINT ["yarn", "start"]

COPY . /app
RUN yarn install
RUN yarn upgrade eq-author-graphql-schema
