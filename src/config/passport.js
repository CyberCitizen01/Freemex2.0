const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy

const { models: { Player } } = require('./../models')

module.exports = () => {
  passport.serializeUser((player, done) => {
    done(null, player.uuid)
  })

  passport.deserializeUser((uuid, done) => {
    Player.findOne({
      where: { uuid }
    })
      .then((player) => {
        done(null, player)
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
      Player.findOne({
        where: { googleId: profile.id }
      })
        .then((player) => {
          if (player === null) {
            Player.create({
              username: profile.displayName,
              name: `${profile.name.givenName} ${profile.name.familyName}`,
              email: profile._json.email,
              googleId: profile.id
            })
              .then((player) => {
                done(null, player)
                console.log('Google player created')
              })
              .catch((error) => {
                done(error)
                console.log('Unable to create google player', error)
              })
          } else {
            done(null, player)
            console.log('Already present')
          }
        })
        .catch((error) => {
          done(error)
          console.log('Unable to query for player.', error)
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
      Player.findOne({
        where: { githubId: profile.id }
      })
        .then((player) => {
          if (player === null) {
            Player.create({
              username: profile.username,
              name: `${profile.username}`,
              email: profile.emails[0].value,
              githubId: profile.id
            })
              .then((player) => {
                done(null, player)
                console.log('Github player created')
              })
              .catch((error) => {
                done(error)
                console.log('Unable to create github player', error)
              })
          } else {
            done(null, player)
            console.log('Already present')
          }
        })
        .catch((error) => {
          done(error)
          console.log('Unable to query for player.', error)
        })
    })
  )
}
