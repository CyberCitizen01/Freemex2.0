const { Router } = require('express')
const { models: { Player } } = require('../models')

const router = Router()

router.route('/')
  .get((req, res) => {
    // Leaderboard
    if (req.query.sort === 'true') {
      Player.findAll({
        order: [['valueInTotal', 'DESC']],
        attributes: ['uuid', 'username', 'valueInTotal']
      })
        .then((players) => {
          res.status(200).json({
            message: `GET ${req.originalUrl} success.`,
            players
          })
        })
        .catch((error) => {
          console.log('Unable to fetch sorted players:', error)
          res.status(500).json({
            message: 'Unable to fetch sorted players',
            query: req.query
          })
        })
      return
    }

    // All players with redacted fields
    Player.findAll({ attributes: ['uuid', 'username'] })
      .then((players) => {
        res.status(200).json({
          message: `GET ${req.originalUrl} success.`,
          players
        })
      })
      .catch((error) => {
        console.log('Unable to fetch players:', error)
        res.status(500).json({
          message: 'Unable to fetch players',
          query: req.query
        })
      })
  })

  .put((req, res) => {
    // Change username
    if (req.query.scope !== 'username') {
      console.log('Forbidden, only username can be updated.')
      res.status(403).json({
        message: 'Forbidden, only username can be updated.',
        query: req.query
      })
      return
    }

    req.user.username = req.body.username
    req.user.save({
      fields: ['username'],
      returning: ['uuid', 'username', 'email']
    })
      .then((player) => {
        res.status(200).json({
          message: `PUT ${req.originalUrl} success.`,
          player
        })
      })
      .catch((error) => {
        console.log('Unable to update username', error)
        res.status(500).json({
          message: 'Unable to update username',
          query: req.query,
          body: req.body
        })
      })
  })

module.exports = router
