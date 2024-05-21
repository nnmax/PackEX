FROM node:lts-alpine as base

FROM base AS deps

WORKDIR /app

ENV HUSKY 0
ENV YARN_ENABLE_GLOBAL_CACHE=false
ENV YARN_ENABLE_MIRROR=false
ENV YARN_NM_MODE=hardlinks-local

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install --immutable

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

FROM nginx:alpine

ARG SERVER_NAME
ARG PROXY_PASS
ENV SERVER_NAME=$SERVER_NAME
ENV PROXY_PASS=$PROXY_PASS

COPY ngnix.conf.template /etc/nginx/templates/

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
