const { Router } = require('express')

const router = Router()

router.route('/')
  .get((req, res) => {
    res.status(200).json({
      message: 'GET /routeA is working!!'
    })
  })
  .post((req, res) => {
    res.status(200).json({
      message: 'POST /routeA is working!!',
      body: req.body
    })
  })

module.exports = router
