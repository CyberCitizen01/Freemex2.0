const { Sequelize } = require('sequelize')

// Create connection object
const sequelize = new Sequelize(process.env.PG_DB_URI, {
  logging: process.env.LOGGING === 'false' ? false : console.log
})

// Define models
const modelDefiners = [
  require('./users'),
  require('./playerStocks'),
  require('./stocks')
]

for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize)
}

// Define associations
const { models: { User, PlayerStock, Stock } } = sequelize
try {
  // Each user has many playerstocks
  User.hasMany(PlayerStock, {
    foreignKey: {
      allowNull: false
    }
  })
  PlayerStock.belongsTo(User)

  // Each playerStock is related to one stock
  Stock.hasMany(PlayerStock, {
    foreignKey: {
      allowNull: false
    }
  })
  PlayerStock.belongsTo(Stock)
} catch (error) {
  console.log('Unable to define associations:', error)
}

module.exports = sequelize
