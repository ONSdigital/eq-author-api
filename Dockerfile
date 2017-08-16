FROM node:7
EXPOSE 4000
ENV PORT=4000
WORKDIR /app

ENTRYPOINT ["yarn", "start"]

COPY . /app
RUN yarn install