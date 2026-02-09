import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { AppDataSource } from './database';
import { User, AccountType, AccountStatus } from '../entities/User';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const userRepository = AppDataSource.getRepository(User);
          let user = await userRepository.findOne({
            where: { email: profile.emails?.[0]?.value },
          });

          if (user) {
            return done(null, user);
          }

          const newUser = new User();
          newUser.email = profile.emails?.[0]?.value || '';
          newUser.fullName = profile.displayName || '';
          newUser.accountType = AccountType.BUYER;
          newUser.accountStatus = AccountStatus.ACTIVE;

          user = await userRepository.save(newUser);
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && 
    process.env.FACEBOOK_APP_ID !== 'coming-soon' && 
    process.env.FACEBOOK_APP_SECRET !== 'coming-soon') {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const userRepository = AppDataSource.getRepository(User);
          let user = await userRepository.findOne({
            where: { email: profile.emails?.[0]?.value },
          });

          if (user) {
            return done(null, user);
          }

          const newUser = new User();
          newUser.email = profile.emails?.[0]?.value || '';
          newUser.fullName = profile.displayName || '';
          newUser.accountType = AccountType.BUYER;
          newUser.accountStatus = AccountStatus.ACTIVE;

          user = await userRepository.save(newUser);
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.log('ℹ️  Facebook OAuth not configured - will be available soon');
}

export default passport;
