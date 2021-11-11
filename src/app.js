const express = require('express')
const cors = require('cors')
const cookieSession = require('cookie-session')
const passport = require('passport')
const socketIO = require('socket.io')

const { createServer } = require('http')
const { join } = require('path')

require('dotenv').config()

const app = express()
const server = createServer(app)
const io = socketIO(server, {
  serveClient: false,
  cors: {
    origin: process.env.CORS_ORIGINS || '*'
  }
})

const configSequelize = require('./config/sequelize')
const configPassport = require('./config/passport')

const routes = require('./routes')
const sequelize = require('./models')
const events = require('./eventHandlers')(io)
const middlewares = require('./middlewares')

const PORT = process.env.PORT || 8000

configPassport()

/**
 * Middlewares
 */
app.use(express.json())
app.use(express.static(join(__dirname, '../public/')))
app.use(cors({
  origin: process.env.CORS_ORIGINS || '*'
}))
app.use(cookieSession({
  maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  keys: [process.env.COOKIE_KEY]
}))
app.use(passport.initialize())
app.use(passport.session())

/**
 * Routes
 */
app.use('/auth', routes.auth)
app.use('/api', middlewares.authenticatePlayer, routes.api)
app.use('/admin', middlewares.authenticateAdmin, routes.admin)

/**
 * Socket events
 */
const onConnection = (socket) => {
  socket.on('eventA1', events.eventA1)
  socket.on('eventA2', events.eventA2)
  socket.on('eventB', events.eventB)
}

io.on('connection', onConnection)

/**
 * Main server
 */
async function main () {
  try {
    await configSequelize(sequelize)
  } catch (error) {
    console.error('Unable to configure sequelize:', error)
    process.exit(1)
  }
  server.listen(PORT, () => {
    console.log(`server listenning on ${PORT}`)
  })
}

main()
