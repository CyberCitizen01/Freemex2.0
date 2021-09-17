const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy

const { models: { User } } = require('./../models')

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.uuid)
  })

  passport.deserializeUser((uuid, done) => {
    User.findOne({
      where: { uuid }
    })
      .then((user) => {
        done(null, user)
      })
      .catch((error) => {
        done(error)
      })
  })

  passport.use(
    new GoogleStrategy({
      clientID: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.DOMAIN_NAME}/auth/google/redirect`
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({
        where: { googleId: profile.id }
      })
        .then((user) => {
          if (user === null) {
            User.create({
              username: profile.displayName,
              name: `${profile.name.givenName} ${profile.name.familyName}`,
              email: profile._json.email,
              googleId: profile.id
            })
              .then((user) => {
                done(null, user)
                console.log('Google user created')
              })
              .catch((error) => {
                done(error)
                console.log('Unable to create google user', error)
              })
          } else {
            done(null, user)
            console.log('Already present')
          }
        })
        .catch((error) => {
          done(error)
          console.log('Unable to query for user.', error)
        })
    })
  )

  passport.use(
    new GitHubStrategy({
      clientID: process.env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.DOMAIN_NAME}/auth/github/redirect`,
      scope: ['user:email', 'user:profile']
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({
        where: { githubId: profile.id }
      })
        .then((user) => {
          if (user === null) {
            User.create({
              username: profile.username,
              name: `${profile.username}`,
              email: profile.emails[0].value,
              githubId: profile.id
            })
              .then((user) => {
                done(null, user)
                console.log('Github user created')
              })
              .catch((error) => {
                done(error)
                console.log('Unable to create github user', error)
              })
          } else {
            done(null, user)
            console.log('Already present')
          }
        })
        .catch((error) => {
          done(error)
          console.log('Unable to query for user.', error)
        })
    })
  )
}
