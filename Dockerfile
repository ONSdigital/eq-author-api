FROM node:7
EXPOSE 4000
ENV PORT=4000
WORKDIR /app

ENTRYPOINT ["sh", "docker-entrypoint.sh"]

COPY . /app
RUN yarn install