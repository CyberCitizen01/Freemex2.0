const { Router } = require('express')
const { checkSchedule } = require('../middlewares')

const router = Router()

router.use('/schedule', require('./schedules'))
router.use(checkSchedule)
router.use('/players', require('./players'))
router.use('/stocks', require('./stocks'))
router.use('/assets', require('./assets'))
router.use('/transactions', require('./transactions'))

module.exports = {
  auth: require('./auth'),
  api: router,
  admin: require('./admin')
}
