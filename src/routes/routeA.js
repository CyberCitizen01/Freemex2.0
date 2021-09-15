const { Router } = require('express')
const { models } = require('./../models')

const router = Router()

router.route('/')
  .get(async (_req, res) => {
    try {
      const users = await models.user.findAll()
      res.status(200).json({
        message: 'GET /routeA is working!!',
        users: users.map((user) => {
          return user.toJSON()
        })
      })
    } catch (error) {
      console.log('Unable to fetch users:', error)
      res.status(500).json({
        message: 'Unable to fetch users'
      })
    }
  })
  .post(async (req, res) => {
    try {
      const user = await models.user.create(req.body)
      res.status(200).json({
        message: 'POST /routeA is working!!',
        user: user.toJSON()
      })
    } catch (error) {
      console.log('Unable to create user instance:', error)
      res.status(500).json({
        message: 'Unable to create user instance',
        body: req.body
      })
    }
  })

module.exports = router
