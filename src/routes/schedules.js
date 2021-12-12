const { Router } = require('express')
const { models: { Schedule } } = require('../models')

const router = Router()

router.route('/')
  .get((req, res, next) => {
    Schedule.findOne({
      order: [['createdAt, DESC']]
    })
      .then((schedule) => res.status(200).json({
        message: `GET ${req.originalUrl} success.`,
        schedule: {
          ...schedule.toJSON(),
          id: undefined,
          createdAt: undefined,
          updatedAt: undefined
        }
      }))
      .catch(next)
  })

module.exports = router
