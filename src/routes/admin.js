const { Router } = require('express')
const { pluralize } = require('inflection')
const { models } = require('../models')

const router = Router()

const spareRoutes = [
  /** 
   * Add routes (RegEx) to exclude.
   * Eg. /^DELETE \/admin\/api\/players/
   */
]

for (const [name, model] of Object.entries(models)) {
  router.route(`/${pluralize(name.toLowerCase())}`)
    .use((req, res, next) => {
      if (
        spareRoutes.some((route) => (
          route.test(`${req.method} ${req.originalUrl}`)
        ))
      ) {
        res.sendStatus(404)
        return
      }
      next()
    })
    /**
     * TODO - When a stable express 5 realeases, update request
     * handlers to remove try-catch.
     * Refer: https://expressjs.com/en/guide/error-handling.html
     */
    .get(async (req, res, next) => {
      try {
        const { options } = req.body
        const instances = await model.find(options)
        res.locals.body = instances        
      } catch (error) {
        next(error)
        return
      }
      next()
    })
    .post(async (req, res, next) => {
      try {
        const { instance, options } = req.body
        instance = await model.create(instance, options)
        res.locals.body = instance        
      } catch (error) {
        next(error)
        return
      }
      next()
    })
    .put(async (req, res, next) => {
      try {
        const { instance, options } = req.body
        instance = await model.update(instance, options)
        res.locals.body = instance        
      } catch (error) {
        next(error)
        return
      }
      next()
    })
    .delete(async (req, res, next) => {
      try {
        const { options } = req.body
        /**
         * To prevent destroy everything, refer:
         * https://sequelize.org/v6/manual/model-querying-basics.html#simple-delete-queries
         */
        options.truncate = false
        instance = await model.delete(options)
        res.locals.body = instance        
      } catch (error) {
        next(error)
        return
      }
      next()
    })
    .use((req, res, next) => {
      if (res.locals.body) {
        res.status(200).json({
          message: `${req.method} ${req.originalUrl} success.`,
          [name]: res.locals.body
        })
        return
      }
      res.sendStatus(404)
    })
    .use((err, req, res, next) => {
      if (err.name === 'SequelizeUniqueConstraintError') {
        res.status(403).json({
          message: `Unable to create ${name} instance`,
          details: error.original.detail,
          body: req.body
        })
        return
      }
      next(err)
    })
}

module.exports = router
