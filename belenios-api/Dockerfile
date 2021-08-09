# ---------- SSL ----------
FROM nginx:1.19.1-alpine as ssl

RUN apk update && \
    apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 825 \
    -subj  "/C=/ST=/O=/CN=" \
    -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt;

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
COPY --from=ssl /etc/ssl/private/nginx-selfsigned.key ./src/key.pem
COPY --from=ssl /etc/ssl/certs/nginx-selfsigned.crt ./src/cert.pem

EXPOSE 443

CMD ["node", "./src/Server.js"]
