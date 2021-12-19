<p align="center"><img alt="@bull-board" src="https://raw.githubusercontent.com/felixmosh/bull-board/master/packages/ui/src/static/images/logo.svg" width="128px" /></p>

# <p align="center">Bull-Board-Docker<p>

<p align="center">
Docker image for <a href="https://github.com/felixmosh/bull-board">bull-board</a>.<br />
Allow you to monitor your bull queue without any coding!<br />
Supports <b>both</b>: <a href="https://github.com/OptimalBits/bull">bull</a> and <a href="https://github.com/taskforcesh/bullmq">bullmq</a>.<br />
<p>

<p align="center">
  <a href="https://circleci.com/gh/thalesog/bull-board-docker">
    <img alt="build status" src="https://img.shields.io/circleci/build/gh/thalesog/bull-board-docker/master?style=for-the-badge&color=blueviolet&logo=CircleCI">
  </a>
  <a href="https://www.npmjs.com/org/bull-board">
    <img alt="npm downloads" src="https://img.shields.io/docker/pulls/thalesog/bullboard?style=for-the-badge&color=blueviolet&logo=Docker">
  </a>
  <img alt="open issues" src="https://img.shields.io/github/issues/thalesog/bull-board-docker?style=for-the-badge&color=blueviolet"/>
  <a href="https://github.com/vcapretz/bull-board/blob/master/LICENSE">
    <img alt="licence" src="https://img.shields.io/github/license/thalesog/bull-board-docker?style=for-the-badge&color=blueviolet">
  </a>

<p>

# :rocket: Usage

## Quick start with docker

```
docker run -p 3000:3000 thalesog/bullboard
```

will run bull-board interface on `localhost:3000` and connect to your redis instance on `localhost:6379` without password.

To configurate redis see "Environment variables" section.

## Quick start with docker-compose

```yaml
version: '3.7'

services:
  bullboard:
    container_name: bullboard
    image: thalesog/bullboard
    restart: always
    ports:
      - 3000:3000
```

will run bull-board interface on `localhost:3000` and connect to your redis instance on `localhost:6379` without password.

see "Example with docker-compose" section for example with env parameters

## :memo: Environment variables

- `REDIS_HOST` - host to connect to redis (localhost by default)
- `REDIS_PORT` - redis port (6379 by default)
- `REDIS_DB` - redis db to use ('0' by default)
- `REDIS_USE_TLS` - enable TLS true or false (false by default)
- `REDIS_PASSWORD` - password to connect to redis (no password by default)
- `BULL_PREFIX` - prefix to your bull queue name (bull by default)
- `BULL_VERSION` - version of bull lib to use 'BULLMQ' or 'BULL' ('BULLMQ' by default)
- `PROXY_PATH` - proxyPath for bull board, e.g. https://<server_name>/my-base-path/queues [docs] ('' by default)
- `USER_LOGIN` - login to restrict access to bull-board interface (disabled by default)
- `USER_PASSWORD` - password to restrict access to bull-board interface (disabled by default)

## :closed_lock_with_key: Restrict access with login and password

To restrict access to bull-board use `USER_LOGIN` and `USER_PASSWORD` env vars.
Only when both `USER_LOGIN` and `USER_PASSWORD` specified, access will be restricted with login/password

### Example with docker-compose

```yaml
version: '3.7'

services:
  redis:
    container_name: redis
    image: redis
    restart: always
    ports:
      - 6379:6379

  bullboard:
    container_name: bullboard
    image: thalesog/bullboard
    restart: always
    ports:
      - 3000:3000
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
      USER_LOGIN: 'admin'
      USER_PASSWORD: 'admin'
    depends_on:
      - redis
```
