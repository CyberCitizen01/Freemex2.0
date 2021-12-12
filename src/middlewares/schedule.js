const { models: { Schedule } } = require('../models')

/**
 * Requests made before and after the event are rejected.
 */
async function checkSchedule (req, res, next) {
  const now = new Date()
  let started = false
  let ended = false
  try {
    const schedule = await Schedule.findOne({
      order: [['createdAt, DESC']]
    })
    if (schedule.start.getTime() <= now.getTime()) {
      started = true
    }
    if (schedule.end.getTime() <= now.getTime()) {
      ended = true
    }
    req.locals.ctx = {
      started, ended
    }
    if (!started || ended) {
      res.status(403).json({
        message: 'Forbidden, for the given schedule, ' + (
          ended
            ? 'the event has ended.'
            : 'the event has not started yet.'
        ),
        schedule
      })
    }
  } catch (error) {
    next(error)
  }
  next()
}

module.exports = { checkSchedule }
