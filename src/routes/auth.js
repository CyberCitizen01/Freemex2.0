const { Router } = require('express')
const passport = require('passport')

const router = Router()

router.get('/logout', (req, res) => {
  if (req.user) { req.logout() }
  res.redirect('/')
})

router.get('/google', passport.authenticate(
  'google',
  {
    scope: ['profile', 'email']
  }
))
router.get('/github', passport.authenticate(
  'github',
  {
    scope: ['user:email', 'user:profile']
  }
))

router.get('/google/redirect', passport.authenticate('google', { failureRedirect: '/login' }), (_req, res) => {
  res.redirect('/')
})

router.get('/github/redirect', passport.authenticate('github', { failureRedirect: '/login' }), (_req, res) => {
  res.redirect('/')
})

module.exports = router
