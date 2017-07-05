FROM node:8
EXPOSE 4000
WORKDIR /app
ENTRYPOINT ["./scripts/run_app.sh"]
