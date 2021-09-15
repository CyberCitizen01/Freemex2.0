const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.PG_DB_URI)

const modelDefiners = [
  require('./users')
]

async function main () {
  try {
    await sequelize.authenticate()
    console.log('DB Connection successful.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
  try {
    for (const modelDefiner of modelDefiners) {
      await modelDefiner(sequelize)
    }
  } catch (error) {
    console.error('Unable to define some model(s):', error)
  }
  try {
    await sequelize.sync()
    console.log('DB Sync successful.')
  } catch (error) {
    console.error('Unable to sync:', error)
  }
}

main()

module.exports = sequelize
