FROM node:lts-alpine as base

FROM base AS deps

WORKDIR /app

ENV HUSKY 0
ENV YARN_ENABLE_GLOBAL_CACHE=false
ENV YARN_ENABLE_MIRROR=false
ENV YARN_NM_MODE=hardlinks-local
ENV NEXT_TELEMETRY_DISABLED 1

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install --immutable

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

FROM nginx:alpine

COPY ngnix.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
