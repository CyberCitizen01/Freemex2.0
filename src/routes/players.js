const { Router } = require('express')
const { models: { Player } } = require('../models')

const router = Router()

router.route('/')
  .get((req, res) => {
    // Leaderboard
    if (req.query.sort === 'true') {
      Player.findAll({
        order: [['valueInTotal', 'DESC']],
        attributes: ['uuid', 'avatar', 'username', 'valueInTotal']
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

    // Profile of this player
    res.status(200).json({
      message: `GET ${req.originalUrl} success.`,
      player: {
        ...req.user.toJSON(),
        id: undefined,
        googleId: undefined,
        githubId: undefined,
        createdAt: undefined,
        updatedAt: undefined
      }
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

    const { username } = req.body
    if (username.length < 5) {
      res.status(400).json({
        message: 'Username should be of atleast 5 characters.',
        body: req.body
      })
      return
    }
    req.user.username = username
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
        if (error.name === 'SequelizeUniqueConstraintError') {
          res.status(500).json({
            message: 'Username should be unique.',
            details: [error.original.detail] || error.errors.map(({ message }) => message),
            body: req.body
          })
          return
        }
        res.status(500).json({
          message: 'Unable to update username',
          query: req.query,
          body: req.body
        })
      })
  })

module.exports = router
