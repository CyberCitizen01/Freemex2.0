module.exports = (io) => {
  function eventB (payload, callback) {
    const socket = this
    console.log(payload)
    callback(null, 'eventB registered successfully')
    socket.emit('eventD')
  }

  return {
    eventB
  }
}
