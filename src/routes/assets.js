const { Router } = require('express')

const router = Router()

router
  .get('/', (req, res, next) => {
    req.user.getAssets({ include: 'Stock' })
      .then((assets) => res.status(200).json({
        message: `GET ${req.originalUrl} success.`,
        assets: assets.map((asset) => ({
          asset: {
            quantity: asset.quantity,
            invested: asset.invested,
            updatedAt: asset.updatedAt
          },
          Stock: {
            ...asset.Stock.toJSON(),
            id: undefined,
            createdAt: undefined
          }
        }))
      }))
      .catch(next)
  })

module.exports = router
