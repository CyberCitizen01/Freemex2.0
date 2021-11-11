const { Router } = require('express')
const { models: { Player } } = require('../models')

const router = Router()

router.route('/')
  .post((req, res) => {
    Player.create(req.body, {
      fields: ['uuid', 'username', 'name', 'email']
    })
      .then((player) => {
        res.status(200).json({
          message: `POST ${req.originalUrl} success.`,
          player
        })
      })
      .catch((error) => {
        console.log('Unable to create player instance:', error)
        if (error.name === 'SequelizeUniqueConstraintError') {
          res.status(403).json({
            message: 'Unable to create player instance',
            details: error.original.detail,
            body: req.body
          })
          return
        }
        res.status(500).json({
          message: 'Unable to create player instance',
          body: req.body
        })
      })
  })

module.exports = router
