module.exports = (io) => {
  const { eventA1, eventA2 } = require('./eventAHandler')(io)
  const { eventB } = require('./eventBHandler')(io)

  return {
    eventA1,
    eventA2,
    eventB
  }
}
