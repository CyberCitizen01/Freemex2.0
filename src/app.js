const express = require('express')
const cors = require('cors')
const cookieSession = require('cookie-session')
const passport = require('passport')
const socketIO = require('socket.io')

const { createServer } = require('http')
const { join } = require('path')

require('dotenv').config()

const configSequelize = require('./config/sequelize')
const configPassport = require('./config/passport')

const routes = require('./routes')
const sequelize = require('./models')
const middlewares = require('./middlewares')
const { periodicUpdate, updateTable } = require('./utils/sequelize')
const {
  updatePlayersValue, updatePlayersValueOptions, inTradingHrs
} = require('./utils/misc')

const PORT = process.env.PORT || 8000
const STOCKS_UPDATE_INTERVAL = process.env.STOCKS_UPDATE_INTERVAL || 30 * 1000 // 30 seconds
// NOTE: Below, only time(HH:mm:ss.sssZ) matters i.e. date(YYYY-MM-DD) can be anything.
const NASDAQ_TRADING_HOURS_START = (
  new Date(process.env.NASDAQ_TRADING_HOURS_START || 'March 3, 2022 19:00:00+05:30')
)
const NASDAQ_TRADING_HOURS_END = (
  new Date(process.env.NASDAQ_TRADING_HOURS_END || 'March 6, 2022 01:30:00+05:30')
)
const NASDAQ_TRADING_HOURS_OFFSET = (
  new Date(process.env.NASDAQ_TRADING_HOURS_OFFSET || 2 * 60 * 1000) // 2 minutes
)

const app = express()
const server = createServer(app)
const io = socketIO(server, {
  serveClient: false,
  cors: {
    origin: process.env.CORS_ORIGINS || '*'
  }
})
const cookieSessionMiddleware = cookieSession({
  maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  sameSite: 'strict',
  domain: (new URL(process.env.DOMAIN_NAME)).hostname,
  keys: [process.env.COOKIE_KEY]
})

configPassport()

/**
 * Middlewares
 */
app.use(express.json())
app.use(express.static(join(__dirname, '../public/')))
app.use(cors({
  origin: process.env.CORS_ORIGINS || '*'
}))
app.use(cookieSessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())

/**
 * Routes
 */
app.use('/auth', routes.auth)
app.use('/api', middlewares.auth.player, routes.api)
app.use('/admin/api', middlewares.auth.admin, routes.admin)

let marketCount = 0

async function main () {
  /**
   * Configure Database
   *
   * > Test the connection with DB.
   * > Sync all defined models to the DB.
   * > Preload Stocks table if empty.
   */
  try {
    await configSequelize(sequelize)
  } catch (error) {
    console.error('Unable to configure sequelize:', error)
    process.exit(1)
  }

  /**
   * ==========
   * WEBSOCKETS
   * ==========
   */
  // Middlewares
  // Convert a express middleware to a Socket.IO middleware
  // const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)
  // io.use(wrap(cookieSessionMiddleware))
  // io.use(wrap(passport.initialize()))
  // io.use(wrap(passport.session()))
  // io.use((socket, next) => {
  //   if (socket.request.user) {
  //     next()
  //   } else {
  //     next(new Error('Unauthorized'))
  //   }
  // })

  // Keep track of number of Websocket connections
  io.on('connection', (socket) => {
    marketCount++
    console.log(`New connection, marketCount: ${marketCount}`)
    socket.on('disconnect', () => {
      marketCount--
      console.log(`Disconnected, marketCount: ${marketCount}`)
    })
  })

  // TODO - Add a route to start this `periodicUpdate` fn.
  //        so that it executes only when the event is
  //        active (To spare some resources).

  /**
   * Periodically update Stock table from Stocks API.
   * and if there are any players with non zero value
   * in stocks, then update those players' valueInStocks
   * and hence valueInTotal, according to the updated
   * latestPrice of stocks.
   */
  periodicUpdate({
    ms: STOCKS_UPDATE_INTERVAL,
    conditions: [
      () => {
        if (inTradingHrs({
          start: NASDAQ_TRADING_HOURS_START,
          end: NASDAQ_TRADING_HOURS_END,
          offset: NASDAQ_TRADING_HOURS_OFFSET
        })) {
          console.log('In trading hours...')
          return true
        }
        console.log('Not in trading hours.')
        return false
      }
    ],
    factory: [(
      process.env.USE_FAKE_STOCKS_API === 'true'
        ? require('./utils/stocksapi').fakeStocksDataFactory
        : require('./api/stocks').stocksDataFactory
    )],
    model: {
      model: sequelize.models.Stock,
      options: {
        attributes: ['id', 'name', 'code', 'latestPrice']
      }
    },
    callback: (stocks, error) => {
      if (error) {
        console.log(error)
        return
      }
      console.log(JSON.stringify(stocks.map(({ code }) => code)))
      console.log(stocks.length, 'Stocks updated')
      io.emit('market', JSON.parse(JSON.stringify(stocks)))
      updateTable({
        factory: [updatePlayersValue, stocks],
        model: {
          model: sequelize.models.Player,
          options: updatePlayersValueOptions
        },
        callback: (players, error) => {
          if (error) {
            console.log(error)
            return
          }
          console.log(players.length, 'players updated.')
        }
      })
    }
  })

  /**
   * Main server
   */
  server.listen(PORT, () => {
    console.log(`server listenning on ${PORT}`)
  })
}

main()
