const { DataTypes } = require('sequelize')

/**
 * Define PlayerStock model.
 * @param {Sequelize} sequelize - Sequelize connection object
 */
module.exports = (sequelize) => {
  sequelize.define('PlayerStock', {
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    invested: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    }
  })
  console.log('Defining PlayerStock model successful.')
}
