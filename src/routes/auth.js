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
router.get('/google/redirect', passport.authenticate('google', { failureRedirect: '/login' }), (_req, res) => {
  res.redirect('/')
})

router.get('/github', passport.authenticate(
  'github',
  {
    scope: ['user:email', 'user:profile']
  }
))
router.get('/github/redirect', passport.authenticate('github', { failureRedirect: '/login' }), (_req, res) => {
  res.redirect('/')
})

router.get('/admin', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.clearCookie('__u')
    res.status(400).redirect('/')
    return
  }
  let isAdmin = true
  isAdmin = process.env.ADMIN_USERNAME === username && true
  isAdmin = process.env.ADMIN_PASSWORD === password && true
  if (!isAdmin) {
    res.clearCookie('__u')
    res.status(401).redirect('/')
    return
  }
  /* eslint-disable new-cap -- ¯\_(ツ)_/¯ built-in */
  const cookie = new Buffer.from(`${username}:${password}`).toString('base64')
  /* eslint-enable new-cap */
  res.cookie('__u', cookie)
  res.status(200).redirect('/dashboard')
})

module.exports = router
