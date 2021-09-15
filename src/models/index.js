const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.PG_DB_URI, {
  logging: process.env.LOGGING === 'false' ? false : console.log
})

const modelDefiners = [
  require('./users')
]

for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize)
}

module.exports = sequelize
