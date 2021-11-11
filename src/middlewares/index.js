function authenticatePlayer (req, res, next) {
  // if (!req.isAuthenticated()) {
  //   res.status(401).redirect('/')
  // }
  next()
}

function authenticateAdmin (req, res, next) {
  // const authorizationHeader = req.headers.authorization

  // if (!authorizationHeader) {
  //   res.setHeader('WWW-Authenticate', 'Basic')
  //   res.statusCode = 401
  //   return next(new Error('You are not authenticated'))
  // }

  // /* eslint-disable new-cap -- ¯\_(ツ)_/¯ built-in */
  // const auth = new Buffer.from(authorizationHeader.split(' ')[1], 'base64').toString().split(':')
  // /* eslint-enable new-cap */
  // const username = auth[0]
  // const password = auth[1]

  // if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
  //   res.setHeader('WWW-Authenticate', 'Basic')
  //   res.statusCode = 401
  //   return next(new Error('You are not authenticated'))
  // }

  next()
}

module.exports = { authenticatePlayer, authenticateAdmin }
