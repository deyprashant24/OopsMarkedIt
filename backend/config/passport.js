const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ where: { email: profile.emails[0].value } });
      
      if (!user) {
        user = await User.create({
          name: profile.displayName, // <-- Updated mapping
          email: profile.emails[0].value,
          password: 'google-auth-no-password' 
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));