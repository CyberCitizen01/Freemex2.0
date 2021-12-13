const spareRoutes = [
  /^GET \/api\/players\?sort=true/, // Leaderboard
  /^GET \/api\/schedule/ // Schedule
]

/**
 * Player needs to be authenticated to continue, except
 * if the requested route is in `spareRoutes`.
 */
function player (req, res, next) {
  if (
    !(spareRoutes.some((route) => (
      route.test(`${req.method} ${req.originalUrl}`)
    ))) &&
    !req.isAuthenticated()
  ) {
    res.status(401).redirect('/')
  }
  next()
}

/**
 * Admin needs to be authenticated to continue.
 */
function admin (req, res, next) {
  const cookie = req.headers.cookie
    .split('; ')
    .find((c) => c.startsWith('__u='))

  if (!cookie) {
    res.status(400).redirect('/')
    return
  }

  /* eslint-disable new-cap -- ¯\_(ツ)_/¯ built-in */
  const [username, password] = (
    new Buffer
      .from(cookie.split('=')[1], 'base64')
      .toString()
      .split(':')
  )
  /* eslint-enable new-cap */

  let isAdmin = true
  isAdmin = process.env.ADMIN_USERNAME === username && true
  isAdmin = process.env.ADMIN_PASSWORD === password && true
  if (!isAdmin) {
    res.clearCookie('__u')
    res.status(401).redirect('/')
    return
  }

  next()
}

module.exports = { player, admin }
