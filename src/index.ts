import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import bodyParser from 'body-parser';
import Queue from 'bull';
import { Queue as MqQueue } from 'bullmq';
import { ensureLoggedIn } from 'connect-ensure-login';
import session from 'cookie-session';
import express from 'express';
import Redis from 'ioredis';
import morgan from 'morgan';
import passport from 'passport';
import { config } from './config';
import { authRouter } from './login';

const redisConfig = {
  redis: {
    port: config.REDIS_PORT,
    host: config.REDIS_HOST,
    db: config.REDIS_DB,
    ...(config.REDIS_PASSWORD && { password: config.REDIS_PASSWORD }),
  },
};

const serverAdapter = new ExpressAdapter();
const client = new Redis({
  db: config.REDIS_DB,
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
});
const { replaceQueues } = createBullBoard({ queues: [], serverAdapter });
const router = serverAdapter.getRouter();

async function loadInitialQueues() {
  console.log('bull-board is fetching queue list, please wait...');
  const keys = await client.keys(`${config.BULL_PREFIX}:*`);
  const uniqKeys = [...new Set(keys.map((key) => key.replace(/^.+?:(.+?):.+?$/, '$1')))];
  const queueList = uniqKeys.sort().map((item) => {
    if (config.BULL_VERSION === 'BULLMQ') {
      return new BullMQAdapter(new MqQueue(item, { connection: redisConfig.redis }));
    }
    return new BullAdapter(new Queue(item, redisConfig));
  });

  replaceQueues(queueList);
  console.log('done!');
}

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

if (app.get('env') !== 'production') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  if (config.PROXY_PATH) {
    // @ts-ignore
    req.proxyUrl = config.PROXY_PATH;
  }

  next();
});

const sessionOpts = {
  name: 'bull-board.sid',
  secret: Math.random().toString(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: '/',
    httpOnly: false,
    secure: false,
  },
};

app.use(session(sessionOpts));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));

if (config.AUTH_ENABLED) {
  app.use(config.LOGIN_PAGE, authRouter);
  app.use(config.HOME_PAGE, ensureLoggedIn(config.LOGIN_PAGE), router);
} else {
  app.use(config.HOME_PAGE, router);
}
app.listen(config.PORT, () => {
  console.log(`bull-board is started http://localhost:${config.PORT}${config.HOME_PAGE}`);
  loadInitialQueues();
});
