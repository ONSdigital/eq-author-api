FROM node:6
RUN apt-get update -y && apt-get upgrade -y
EXPOSE 4000
WORKDIR /app
ENTRYPOINT ["./scripts/run_app.sh"]
