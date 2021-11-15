const { Router } = require('express')
const { models: { Transaction, Stock, Asset } } = require('../models')

const router = Router()

router.route('/')
  .get((req, res) => {
    req.user.getTransactions({
      include: {
        model: 'Stock',
        attributes: ['name', 'code']
      }
    })
      .then(transactions => res.status(200).json({
        message: `GET ${req.originalUrl} success.`,
        transactions
      }))
  })
  .post(async (req, res) => {
    if (!req.query.type || !req.body.code || !req.body.quantity) {
      res.status(400).json({
        message: 'Bad request, missing required data',
        query: req.query,
        body: req.body
      })
      return
    }
    if (!(Transaction.rawAttributes.type.values.indexOf(req.query.type) > -1)) {
      res.status(404).json({
        message: `Transaction type ${req.query.type} not found`,
        query: req.query,
        body: req.body
      })
      return
    }

    const stock = await Stock.findOne({
      attributes: ['id', 'latestPrice'],
      where: {
        code: req.body.code
      }
    })
    if (stock === null) {
      res.status(404).json({
        message: `Stock of code ${req.body.code} not found`,
        query: req.query,
        body: req.body
      })
      return
    }
    const transaction = Transaction.build({
      type: req.query.type,
      quantity: req.body.quantity,
      price: stock.latestPrice,
      StockId: stock.id,
      PlayerId: req.user.id
    })
    const [asset, isNew] = await Asset.findOrBuild({
      where: {
        StockId: stock.id,
        PlayerId: req.user.id
      }
    })

    const transactionAmount = stock.latestPrice * req.body.quantity

    switch (req.query.type) {
      case 'bought': {
        if (!(req.user.valueInCash >= transactionAmount)) {
          res.status(403).json({
            message: 'Forbidden, Not enough cash',
            query: req.query,
            body: req.body
          })
          return
        }
        transaction.netProfit = 0
        asset.quantity += req.body.quantity
        asset.invested += transactionAmount
        break
      }
      case 'sold': {
        if (isNew || req.body.quantity > asset.quantity) {
          res.status(403).json({
            message: 'Forbidden, ' + (
              isNew
                ? `You don't have an asset for ${req.body.code}`
                : `You have only ${asset.quantity} stocks`
            ),
            query: req.query,
            body: req.body
          })
        }
        const costBasis = req.body.quantity * (asset.invested) / (asset.quantity)
        transaction.netProfit = transactionAmount - costBasis
        asset.quantity -= req.body.quantity
        asset.invested -= transactionAmount
        break
      }
    }
    await transaction.save()
    await asset.save()
    res.status(200).json({
      message: `POST ${req.originalUrl} success.`,
      transaction,
      asset
    })
  })

module.exports = router
