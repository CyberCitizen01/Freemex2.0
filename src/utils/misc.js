const { Op } = require('sequelize')
const { models: { Asset } } = require('../models')

const updatePlayersValueOptions = {
  where: {
    valueInStocks: {
      [Op.gt]: 0
    }
  },
  attributes: [
    'id',
    'valueInCash',
    'valueInStocks',
    'valueInTotal'
  ],
  include: {
    model: Asset,
    where: {
      quantity: {
        [Op.gt]: 0
      }
    },
    attributes: ['quantity', 'StockId']
  }
}

async function updatePlayersValue (players, stocks) {
  stocks = stocks.map((stock) => ({
    ...stock.toJSON(), latestPrice: parseFloat(stock.latestPrice)
  }))
  for (const player of players) {
    player.valueInStocks = 0
    player.valueInCash = parseFloat(player.valueInCash)
    for (const asset of player.Assets) {
      const stock = stocks.find(stock => stock.id === asset.StockId)
      player.valueInStocks += stock.latestPrice * asset.quantity
    }
    player.valueInTotal = player.valueInCash + player.valueInStocks
  }
  return players
}

function inTradingHrs ({ start, end, offset }) {
  const day = 24 * 60 * 60 * 1000
  const now = new Date()

  if (
    (
      (start.getTime() % day) - (offset.getTime() % day) < (now.getTime() % day)
    ) && (
      (now.getTime() % day) < (end.getTime() % day) + (offset.getTime() % day)
    )
  ) {
    return true
  }
  return false
}

module.exports = {
  updatePlayersValue,
  updatePlayersValueOptions,

  inTradingHrs
}
