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
const { stocksDataFactory } = require('./api/stocks')
const { periodicUpdate } = require('./utils/sequelize')

const PORT = process.env.PORT || 8000
const UPDATE_MARKET_INTERVAL = process.env.UPDATE_MARKET_INTERVAL || 30 * 1000 // 30 seconds

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
app.use('/api', middlewares.authenticatePlayer, routes.api)
app.use('/admin', middlewares.authenticateAdmin, routes.admin)

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
  const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)
  io.use(wrap(cookieSessionMiddleware))
  io.use(wrap(passport.initialize()))
  io.use(wrap(passport.session()))
  io.use((socket, next) => {
    if (socket.request.user) {
      next()
    } else {
      next(new Error('Unauthorized'))
    }
  })

  // Keep track of number of Websocket connections
  io.on('connection', (socket) => {
    marketCount++
    console.log(marketCount)
  })

  // Periodically update Stock table from Stocks API.
  periodicUpdate(
    UPDATE_MARKET_INTERVAL, stocksDataFactory, sequelize.models.Stock,
    (instances) => {
      const data = instances.map((instance) => instance.toJSON())
      console.log(JSON.stringify(data.map(({ code }) => code)))
      io.emit('market', data)
      console.log(data.length, 'Stocks updated')
    },
    ['name', 'code']
  )

  /**
   * Main server
   */
  server.listen(PORT, () => {
    console.log(`server listenning on ${PORT}`)
  })
}

main()
