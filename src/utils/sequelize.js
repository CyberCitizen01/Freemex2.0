/**
 * Update the `model` table, with the data
 * generated from `factory`, and call the
 * `callback` after updating the whole table.
 *
 * @param {Object[]} params
 * @param {Object} params[].factory
 * @param {promise} params[].factory.factory
 * @param {Array} params[].factory.factoryParams
 * @param {Model} params[].model
 * @param {function} params[].callback
 * @param {Object} params[].options  - To pass as `options`, i.e. `model.findAll(options)`
 */
function updateTable (params) {
  const { factory: [factory, ...factoryParams], model, callback, options } = params
  model.findAll(options)
    .then((instances) => {
      if (instances.length === 0) {
        callback(instances, `Found ${instances.length} instances from '${model.name}' model.`)
        return
      }
      factory(instances, ...factoryParams)
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
    // .catch(error => console.log('Unable to fetch from DB:', error))
}

/**
 * Periodically update the `model` table, over an interval `ms`,
 * with the data generated from `factory`, and call the `callback`
 * after iteratively updating the whole table.
 *
 * i.e. `updateTable` with setInterval
 *
 * @param {Object[]} params
 * @param {number} params[].ms
 * @param {Object} params[].factory
 * @param {promise} params[].factory.factory
 * @param {Array} params[].factory.factoryParams
 * @param {Model} params[].model
 * @param {function} params[].callback
 * @param {Object} params[].options  - To pass as `options`, i.e. `model.findAll(options)`
 * @returns Interval from `setInterval`
 */
function periodicUpdate (params) {
  const { ms } = params
  return setInterval((function _interval () {
    updateTable(params)
    return _interval
  })(), ms)
}

module.exports = { updateTable, periodicUpdate }
