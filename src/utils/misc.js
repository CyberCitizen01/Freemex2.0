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
  for (const player of players) {
    player.valueInStocks = 0
    for (const asset of player.Assets) {
      const stock = stocks.find(stock => stock.id === asset.StockId)
      player.valueInStocks += stock.latestPrice * asset.quantity
    }
    player.valueInTotal = player.valueInCash + player.valueInStocks
  }
  return players
}

module.exports = {
  updatePlayersValue,
  updatePlayersValueOptions
}
