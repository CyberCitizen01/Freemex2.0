const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { join } = require('path')

const socketIO = require('socket.io')

require('dotenv').config()

const app = express()
const server = createServer(app)
const io = socketIO(server, {
  serveClient: false,
  cors: {
    origin: process.env.CORS_ORIGINS || '*'
  }
})

const routes = require('./routes')
const events = require('./eventHandlers')(io)

const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(express.static(join(__dirname, '../public/')))

app.use(cors({
  origin: process.env.CORS_ORIGINS || '*'
}))

app.use('/routeA', routes.routeA)

const onConnection = (socket) => {
  socket.on('eventA1', events.eventA1)
  socket.on('eventA2', events.eventA2)
  socket.on('eventB', events.eventB)
}

io.on('connection', onConnection)

server.listen(PORT, () => {
  console.log(`server listenning on ${PORT}`)
})
