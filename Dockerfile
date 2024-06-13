# Build the GeoIP2 module and Nginx from source
FROM alpine as geoip_builder

RUN apk add --no-cache \
    build-base \
    curl \
    geoip-dev \
    libmaxminddb-dev \
    libxslt-dev \
    linux-headers \
    openssl-dev \
    pcre-dev \
    zlib-dev

WORKDIR /tmp

ARG NGINX_VERSION=1.27.0
ARG GEOIP2_VERSION=3.4

# Download sources
RUN curl -LO http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz \
    && curl -LO https://github.com/leev/ngx_http_geoip2_module/archive/refs/tags/$GEOIP2_VERSION.tar.gz

# Extract sources
RUN tar xzf nginx-$NGINX_VERSION.tar.gz \
    && tar xzf $GEOIP2_VERSION.tar.gz

# Build Nginx with the GeoIP2 module
RUN cd nginx-$NGINX_VERSION \
    && ./configure --with-compat --add-dynamic-module=../ngx_http_geoip2_module-$GEOIP2_VERSION \
    && make modules

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

RUN apk add --no-cache libmaxminddb curl

ARG SERVER_NAME
ARG PROXY_PASS
ARG MAXMIND_ACCOUNT_ID
ARG MAXMIND_LICENSE_KEY

ENV SERVER_NAME=$SERVER_NAME
ENV PROXY_PASS=$PROXY_PASS

RUN curl -O -J -L -u $MAXMIND_ACCOUNT_ID:$MAXMIND_LICENSE_KEY 'https://download.maxmind.com/geoip/databases/GeoLite2-Country/download?suffix=tar.gz'
RUN tar -xvzf GeoLite2-Country_*.tar.gz
RUN mkdir -p /etc/nginx/geoip && mv GeoLite2-Country_*/GeoLite2-Country.mmdb /etc/nginx/geoip/
RUN rm -rf GeoLite2-Country_*

COPY --from=geoip_builder /tmp/nginx-$NGINX_VERSION/objs/ngx_http_geoip2_module.so /usr/lib/nginx/modules/

RUN chown nginx:nginx /etc/nginx/geoip/GeoLite2-Country.mmdb

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

COPY nginx.conf /etc/nginx/
COPY nginx.conf.template /etc/nginx/templates/

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
