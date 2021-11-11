/**
 * Periodically update the `model` table, over an interval `ms`,
 * with the data generated from `factory`, and call the `callback`
 * after iteratively updating the whole table.
 *
 * @param {number} ms
 * @param {promise} factory
 * @param {Model} model
 * @param {function} callback
 * @param {string[]} attributes An array of strings to pass as `options.attribute` to `model.findAll(options)`
 * @returns Interval from `setInterval`
 */
function periodicUpdate (ms, factory, model, callback, attributes) {
  return setInterval(() => {
    model.findAll({ attributes: ['id', ...attributes] })
      .then((instances) => {
        factory(instances)
          .then((data) => {
            Promise.allSettled(instances.map((instance, index) => {
              return new Promise((resolve, reject) => {
                instance
                  .update(data[index])
                  .then(resolve, reject)
              })
            }))
              .then((results) => {
                const [updatedInstances, failedReasons] = results.reduce((previous, current) => {
                  if (current.status === 'fulfilled') {
                    return [previous[0].concat(current.value), previous[1]]
                  }
                  return [previous[0], previous[1].concat(current.reason)]
                }, [[], []])
                if (failedReasons.length > 0) {
                  console.log('Unable to update certain instances:', failedReasons)
                }
                callback(updatedInstances)
              })
          })
          .catch(error => console.log(`Unable to get data from ${factory.name}:`, error))
      })
      .catch(error => console.log(`Unable to fetch ${attributes} from DB:`, error))
  }, ms)
}

module.exports = { periodicUpdate }
