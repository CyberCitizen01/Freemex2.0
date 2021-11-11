const { STOCKS } = require('../utils/fixtures')

/**
 *
 * @param {Sequelize} sequelize
 */
module.exports = async (sequelize) => {
  /* Connect to DB */
  try {
    await sequelize.authenticate()
    console.log('DB Connection successful.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
  /* Sync models to tables of DB */
  try {
    await sequelize.sync()
    console.log('DB Sync successful.')
  } catch (error) {
    console.error('Unable to sync:', error)
  }
  /* Preload Stocks table if empty */
  const { models: { Stock } } = sequelize
  if (await Stock.count()) {
    console.log('Stocks table is not empty')
    return
  }
  try {
    await Stock.bulkCreate(STOCKS)
    console.log('Preload Stocks table successful.')
  } catch (error) {
    console.error('Unable to preload Stocks table:', error)
  }
}
