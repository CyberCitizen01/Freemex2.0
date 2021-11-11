const { Router } = require('express')
const router = Router()

router.use('/players', require('./players'))
// router.use('/assets', require('./assets'))
// router.use('/transactions', require('./transactions'))

module.exports = {
  auth: require('./auth'),
  api: router,
  admin: require('./admin')
}
