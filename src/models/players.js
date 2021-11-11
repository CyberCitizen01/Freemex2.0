const { DataTypes } = require('sequelize')

/**
 * Define Player model.
 * @param {Sequelize} sequelize - Sequelize connection object
 */
module.exports = (sequelize) => {
  sequelize.define('Player', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    valueInStocks: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false
    },
    valueInCash: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 50000000,
      allowNull: false
    },
    valueInTotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 50000000,
      allowNull: false
    },
    googleId: {
      type: DataTypes.STRING
    },
    githubId: {
      type: DataTypes.STRING
    }
  })
  console.log('Defining Player model successful.')
}
