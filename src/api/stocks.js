const axios = require('axios').default
const { CODES, STOCKS } = require('../utils/fixtures')

const FIELDS = Object.keys(STOCKS[0]).filter((field) => !(
  ['name', 'code'].includes(field)
))

async function getRawStocksData (
  symbols = CODES /* codes is analogous to symbols */,
  filter = FIELDS /* The required attributes (columns) of `Stock` table */
) {
  const queryParams = new URLSearchParams({
    symbols,
    filter,
    types: 'quote',
    token: process.env.STOCKS_API_TOKEN
  })
  const url = `${process.env.STOCKS_API_URI}/stock/market/batch?${queryParams}`
  try {
    const { data, status } = await axios.get(url)
    if (!data) throw Error(`recieved empty data, status:${status}`)
    return data
  } catch (error) {
    console.log('Unable to fetch data from stocks api:', error)
  }
}

async function stocksDataFactory (instances) {
  const symbols = instances.map(({ code }) => code)
  const data = await getRawStocksData(symbols)
  const serializedData = []
  for (const [code, {
    quote: {
      latestPrice, change, changePercent, latestUpdate
    }
  }] of Object.entries(data)) {
    serializedData.push({
      code, latestPrice, change, changePercent, latestUpdate
    })
  }
  // Sort `serilizedData` according to the
  // order of `instances`.
  serializedData.sort((a, b) => (
    symbols.indexOf(a.code) - symbols.indexOf(b.code)
  ))
  return serializedData
}

async function checkCreditsLeft (type = 'credits') {
  const queryParams = new URLSearchParams({
    token: process.env.STOCKS_API_TOKEN
  })
  const url = `${process.env.STOCKS_API_URI}/account/usage/${type}?${queryParams}`
  try {
    const { data, status } = await axios.get(url)
    if (!data) throw Error(`recieved empty data, status:${status}`)
    return data
  } catch (error) {
    console.log('Unable to fetch data from stocks api:', error)
  }
}

module.exports = { stocksDataFactory, getRawStocksData, checkCreditsLeft }

if (require.main === module) {
  /**
  * Gets executed when invoked directly.
  *
  * Can be used to check if rate limit
  * for the API has exceeded.
  */
  (async () => {
    require('dotenv').config()
    const symbols = process.argv.length > 2 ? process.argv.slice(2) : ['GOOG']
    if (process.env.ADF === '1') { // ADF => API Data Factory
      const instances = symbols.map((symbol) => ({ code: symbol }))
      console.log(await stocksDataFactory(instances).catch(console.error))
    } else if (process.env.ARD === '1') { // ARD => API Raw Data
      console.log(await getRawStocksData(symbols).catch(console.error))
    }
    console.log(await checkCreditsLeft().catch(console.error))
  })()
}
