const { Router } = require('express')
const { models } = require('./../models')

const router = Router()

router.route('/')
  .get((_req, res) => {
    models.user.findAll()
      .then((users) => {
        res.status(200).json({
          message: 'GET /routeA is working!!',
          users: users.map((user) => {
            const { uuid, username, email } = user
            return {
              uuid, username, email
            }
          })
        })
      })
      .catch((error) => {
        console.log('Unable to fetch users:', error)
        res.status(500).json({
          message: 'Unable to fetch users'
        })
      })
  })
  .post((req, res) => {
    models.user.create(req.body)
      .then((user) => {
        const { uuid, username, email } = user
        res.status(200).json({
          message: 'POST /routeA is working!!',
          user: {
            uuid, username, email
          }
        })
      })
      .catch((error) => {
        console.log('Unable to create user instance:', error)
        if (error.name === 'SequelizeUniqueConstraintError') {
          res.status(403).json({
            message: 'Unable to create user instance',
            body: req.body,
            detail: error.original.detail
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
