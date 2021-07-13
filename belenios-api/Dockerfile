# ---------- Base ----------
FROM frolvlad/alpine-glibc:alpine-3.9_glibc-2.29 AS base
WORKDIR /app

RUN apk update
RUN apk add yarn
RUN apk add gmp
RUN apk add --no-cache --upgrade bash

# ---------- Builder ----------
FROM base AS builder
COPY package*.json .babelrc ./
RUN yarn install
COPY ./src ./src
RUN yarn build
RUN yarn install --production

# ---------- Release ----------
FROM base AS release

COPY ./dependencies ./dependencies
COPY ./src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./src

EXPOSE 80

CMD ["node", "./src/Server.js"]
