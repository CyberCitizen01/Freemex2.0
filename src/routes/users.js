const { Router } = require('express')
const { models: { User } } = require('../models')

const router = Router()

router.route('/')
  .get((req, res) => {
    // TODO - Only admins should get all user data fields
    if (req.query.sort === 'true') {
      // Leaderboard
      User.findAll({
        order: [['valueInTotal', 'DESC']],
        attributes: ['uuid', 'username', 'valueInTotal']
      })
        .then((users) => {
          res.status(200).json({
            message: `GET ${req.originalUrl} success.`,
            users
          })
        })
        .catch((error) => {
          console.log('Unable to fetch sorted users:', error)
          res.status(500).json({
            message: 'Unable to fetch sorted users',
            query: req.query
          })
        })
      return
    }
    // All Users' data
    let attributes = ['uuid', 'username']
    if (req.query.admin === 'true') {
      attributes = undefined
    }
    User.findAll({ attributes })
      .then((users) => {
        res.status(200).json({
          message: `GET ${req.originalUrl} success.`,
          users
        })
      })
  })
  .put((req, res) => {
    if (req.query.scope !== 'username') {
      console.log('Forbidden, only username can be updated.')
      res.status(403).json({
        message: 'Forbidden, only username can be updated.',
        query: `scope=${req.query.scope}`
      })
      return
    }

    // requires login
    req.user.username = req.body.username
    req.user.save({
      fields: ['username'],
      returning: ['uuid', 'username', 'email']
    })
      .then((user) => {
        res.status(200).json({
          message: `PUT ${req.originalUrl} success.`,
          user
        })
      })
      .catch((error) => {
        console.log('Unable to update username', error)
        res.status(500).json({
          message: 'Unable to update username',
          query: `scope=${req.query.scope}`,
          body: req.body
        })
      })
  })
  .post((req, res) => {
    // TODO - Only admins should create users
    User.create(req.body, {
      fields: ['uuid', 'username', 'name', 'email']
    })
      .then((user) => {
        res.status(200).json({
          message: `POST ${req.originalUrl} success.`,
          user
        })
      })
      .catch((error) => {
        console.log('Unable to create user instance:', error)
        if (error.name === 'SequelizeUniqueConstraintError') {
          res.status(403).json({
            message: 'Unable to create user instance',
            details: error.original.detail,
            body: req.body
          })
          return
        }
        res.status(500).json({
          message: 'Unable to create user instance',
          body: req.body
        })
      })
  })

module.exports = router
