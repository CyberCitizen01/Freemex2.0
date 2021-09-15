module.exports = async (sequelize) => {
  try {
    await sequelize.authenticate()
    console.log('DB Connection successful.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
  try {
    await sequelize.sync()
    console.log('DB Sync successful.')
  } catch (error) {
    console.error('Unable to sync:', error)
  }
}
