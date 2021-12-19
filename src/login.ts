import passport from 'passport';
import { Strategy } from 'passport-local';
import express from 'express';
import { config } from './config';

export const authRouter = express.Router();
export default authRouter;

passport.use(
  new Strategy((username, password, cb) => {
    if (username === config.USER_LOGIN && password === config.USER_PASSWORD) {
      return cb(null, { user: 'bull-board' });
    }

    return cb(null, false);
  })
);

passport.serializeUser<any>((user, cb) => {
  cb(null, user);
});

passport.deserializeUser<any>((user, cb) => {
  cb(null, user);
});

authRouter
  .route('/')
  .get((req, res) => {
    res.render('login');
  })
  .post(
    passport.authenticate('local', {
      successRedirect: config.HOME_PAGE,
      failureRedirect: config.LOGIN_PAGE,
    })
  );
