FROM denoland/deno:2.5.4 AS base

# Builder

FROM base as builder

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

COPY . .
RUN deno install
RUN deno task --cwd web build

# Runner

FROM base as runner

WORKDIR /app

COPY --from=builder /app/web/_fresh ./_fresh 

RUN deno cache _fresh/server.js

EXPOSE 8000

CMD ["serve", "-A", "_fresh/server.js"]
