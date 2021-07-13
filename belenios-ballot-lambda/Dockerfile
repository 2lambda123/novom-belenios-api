# https://docs.aws.amazon.com/lambda/latest/dg/images-create.html

# ---------- Base ----------
FROM frolvlad/alpine-glibc:alpine-3.9_glibc-2.29 AS base
WORKDIR /app
RUN apk update
RUN apk add --no-cache \
    bash \
    libstdc++ \
    build-base \
    libtool \
    autoconf \
    automake \
    libexecinfo-dev \
    make \
    cmake \
    libcurl \
    python3 \
    py3-pip \
    npm \
    yarn \
    gmp
RUN yarn global add npx --prefix /usr/local
RUN yarn global add aws-lambda-ric --prefix /usr/local

# ---------- Builder ----------
FROM base AS builder
COPY package*.json .babelrc ./
RUN yarn install
COPY ./src ./src
RUN yarn build
RUN yarn install --production

# ---------- Release ----------
FROM base as release
COPY ./dependencies ./dependencies
COPY ./src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./src
ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["./src/app.handler"]
