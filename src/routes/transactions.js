const { Router } = require('express')
const { models: { Transaction, Stock, Asset } } = require('../models')

const router = Router()

router.route('/')
  .get((req, res, next) => {
    req.user.getTransactions({
      include: {
        model: Stock,
        attributes: ['name', 'code']
      }
    })
      .then(transactions => res.status(200).json({
        message: `GET ${req.originalUrl} success.`,
        transactions: transactions.map((transaction) => ({
          ...transaction.toJSON(),
          id: undefined,
          PlayerId: undefined,
          StockId: undefined,
          updatedAt: undefined
        }))
      }))
      .catch(next)
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

    const type = req.query.type
    const code = req.body.code
    const quantity = parseInt(req.body.quantity)

    const stock = await Stock.findOne({
      attributes: ['id', 'latestPrice'],
      where: {
        code
      }
    })
    if (stock === null) {
      res.status(404).json({
        message: `Stock of code ${code} not found`,
        query: req.query,
        body: req.body
      })
      return
    }
    const transaction = Transaction.build({
      type,
      quantity,
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

    const transactionAmount = stock.latestPrice * quantity

    switch (type) {
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
        asset.quantity = parseInt(asset.quantity) + parseInt(quantity)
        asset.invested = parseFloat(asset.invested) + parseFloat(transactionAmount)
        break
      }
      case 'sold': {
        if (isNew || quantity > asset.quantity) {
          res.status(403).json({
            message: 'Forbidden, ' + (
              isNew
                ? `You don't have an asset for ${code}`
                : `You have only ${asset.quantity} stocks`
            ),
            query: req.query,
            body: req.body
          })
        }
        const costBasis = quantity * (asset.invested) / (asset.quantity)
        transaction.netProfit = transactionAmount - costBasis
        asset.quantity = parseInt(asset.quantity) - parseInt(quantity)
        asset.invested = parseFloat(asset.invested) - parseFloat(costBasis)
        break
      }
    }
    await transaction.save()
    await asset.save()
    res.status(200).json({
      message: `POST ${req.originalUrl} success.`,
      transaction: {
        ...transaction.toJSON(),
        id: undefined,
        PlayerId: undefined,
        StockId: undefined,
        updatedAt: undefined
      },
      asset: {
        ...asset.toJSON(),
        id: undefined,
        PlayerId: undefined,
        StockId: undefined,
        createdAt: undefined
      },
      Stock: {
        code
      }
    })
  })

module.exports = router
