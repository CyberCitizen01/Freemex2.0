const { DataTypes } = require('sequelize')

/**
 * Define Stock model.
 * @param {Sequelize} sequelize - Sequelize connection object
 */
module.exports = (sequelize) => {
  sequelize.define('Stock', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    latestPrice: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    change: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    changePercent: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    latestUpdate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  })
  console.log('Defining Stock model successful.')
}
