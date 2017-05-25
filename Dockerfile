FROM node:6
COPY . /app
EXPOSE 4000
WORKDIR /app

ENTRYPOINT ["yarn", "start"]
