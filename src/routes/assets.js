const { Router } = require('express')

const router = Router()

router
  .get('/', (req, res) => {
    req.user.getAssets({ include: 'Stock' })
      .then((assets) => res.status(200).json(assets))
  })

module.exports = router
