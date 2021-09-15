const { DataTypes } = require('sequelize')

/**
 * Define user model.
 * @param {Sequelize} sequelize - Sequelize connection object
 */
module.exports = async (sequelize) => {
  try {
    await sequelize.define('user', {
      uuid: {
        type: DataTypes.UUID,
        default: DataTypes.UUIDV4
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      google_id: {
        type: DataTypes.STRING
      },
      github_id: {
        type: DataTypes.STRING
      }
    })
    console.log('Defining user model successful.')
  } catch (error) {
    console.log('Unable to define user model:', error)
  }
}
