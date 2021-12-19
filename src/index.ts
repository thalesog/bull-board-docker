import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullMQAdapter } from '@bull-board/api//bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Queue from 'bull';
import { Queue as MqQueue } from 'bullmq';
import express from 'express';
import redis from 'redis';
import session from 'cookie-session';
import passport from 'passport';
import { ensureLoggedIn } from 'connect-ensure-login';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { authRouter } from './login';
import { config } from './config';

const redisConfig = {
  redis: {
    port: config.REDIS_PORT,
    host: config.REDIS_HOST,
    db: config.REDIS_DB,
    ...(config.REDIS_PASSWORD && { password: config.REDIS_PASSWORD }),
  },
};

const serverAdapter = new ExpressAdapter();
const client = redis.createClient({ ...redisConfig.redis, tls: config.REDIS_USE_TLS === 'true' });
const { setQueues } = createBullBoard({ queues: [], serverAdapter });
const router = serverAdapter.getRouter();

client.KEYS(`${config.BULL_PREFIX}:*`, (err, keys) => {
  const uniqKeys = new Set(keys.map((key) => key.replace(/^.+?:(.+?):.+?$/, '$1')));
  const queueList = Array.from(uniqKeys)
    .sort()
    .map((item) => {
      if (config.BULL_VERSION === 'BULLMQ') {
        return new BullMQAdapter(new MqQueue(item, { connection: redisConfig.redis }));
      }

      return new BullAdapter(new Queue(item, redisConfig));
    });

  setQueues(queueList);
  console.log('done!');
});

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

if (app.get('env') !== 'production') {
  app.use(morgan('combined'));
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
  console.log('bull-board is fetching queue list, please wait...');
});
