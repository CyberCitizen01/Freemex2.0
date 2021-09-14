module.exports = (io) => {
  function eventA1 (payload) {
    const socket = this
    if (payload) {
      socket.emit('eventC')
    }
  }

  function eventA2 (payload, callback) {
    console.log(payload)
    callback(null, 'eventA2 registered successfully')
  }

  return {
    eventA1,
    eventA2
  }
}
