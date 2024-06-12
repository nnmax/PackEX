FROM node:lts-alpine as base

RUN apk add --no-cache libc6-compat g++ make py3-pip python3

FROM base AS deps

WORKDIR /app

ENV HUSKY 0
ENV YARN_ENABLE_GLOBAL_CACHE=false
ENV YARN_ENABLE_MIRROR=false
ENV YARN_NM_MODE=hardlinks-local

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY lib ./lib

RUN yarn install --immutable

FROM base AS builder

WORKDIR /app

ARG REACT_APP_APP_ENV=dev
ENV REACT_APP_APP_ENV=$REACT_APP_APP_ENV

COPY --from=deps /app/node_modules ./node_modules
COPY .yarn ./.yarn
COPY public ./public
COPY src ./src
COPY lib ./lib
COPY yarn.lock .env .env.production craco.config.ts package.json .yarnrc.yml tsconfig.json tailwind.config.js ./

RUN yarn build:$REACT_APP_APP_ENV

FROM nginx:alpine

ARG SERVER_NAME
ARG PROXY_PASS
ENV SERVER_NAME=$SERVER_NAME
ENV PROXY_PASS=$PROXY_PASS

RUN rm /etc/nginx/conf.d/default.conf && \
        mkdir -p /var/cache/nginx/client_temp && \
        mkdir -p /var/cache/nginx/proxy_temp && \
        mkdir -p /var/cache/nginx/fastcgi_temp && \
        mkdir -p /var/cache/nginx/uwsgi_temp && \
        mkdir -p /var/cache/nginx/scgi_temp && \
        chown -R nginx:nginx /var/cache/nginx && \
        chown -R nginx:nginx /etc/nginx/ && \
        chmod -R 755 /etc/nginx/ && \
        chown -R nginx:nginx /var/log/nginx

RUN touch /var/run/nginx.pid && \
        chown -R nginx:nginx /var/run/nginx.pid /run/nginx.pid

USER nginx

COPY nginx.conf.template /etc/nginx/templates/

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
