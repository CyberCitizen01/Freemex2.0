const { Sequelize } = require('sequelize')

// Create connection object
const sequelize = new Sequelize(process.env.PG_DB_URI, {
  logging: process.env.LOGGING === 'false' ? false : console.log
})

// Define models
const modelDefiners = [
  require('./players'),
  require('./assets'),
  require('./stocks'),
  require('./transactions'),
  require('./schedules')
]

for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize)
}

// Define associations
const { models: { Player, Asset, Stock, Transaction } } = sequelize
try {
  // Each player can have many assets
  Player.hasMany(Asset, {
    foreignKey: {
      allowNull: false
    }
  })
  Asset.belongsTo(Player)

  // Each asset is related to one stock
  Stock.hasMany(Asset, {
    foreignKey: {
      allowNull: false
    }
  })
  Asset.belongsTo(Stock)

  // Each player can have many transactions
  Player.hasMany(Transaction, {
    foreignKey: {
      allowNull: false
    }
  })
  Transaction.belongsTo(Player)

  // Each transaction is related to one stock
  Stock.hasMany(Transaction, {
    foreignKey: {
      allowNull: false
    }
  })
  Transaction.belongsTo(Stock)
} catch (error) {
  console.log('Unable to define associations:', error)
}

module.exports = sequelize
