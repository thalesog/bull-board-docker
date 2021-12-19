## this is the stage one , also know as the build step

FROM node:lts
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
COPY . .
RUN yarn install
RUN yarn type-check

## this is stage two , where the app actually runs

FROM node:lts

WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production
COPY --from=0 /usr/src/app/dist ./dist
ENV NODE_ENV production
ENV REDIS_HOST localhost
ENV REDIS_PORT 6379
ENV REDIS_USE_TLS false
ENV REDIS_PASSWORD ''
ENV BULL_PREFIX bull
ENV BULL_VERSION BULLMQ
ENV USER_LOGIN ''
ENV USER_PASSWORD ''
ENV REDIS_DB 0
ENV PROXY_PATH ''
EXPOSE 3000
CMD yarn start:prod

