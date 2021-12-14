const axios = require('axios').default
const { CODES } = require('../utils/fixtures')

async function getRawStocksData (symbols = CODES /* codes is analogous to symbols */) {
  const queryParams = new URLSearchParams({
    symbols,
    types: 'quote',
    token: process.env.STOCKS_API_TOKEN
  })
  const url = `${process.env.STOCKS_API_URI}?${queryParams}`
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
  // TODO - Make sure that, `serilizedData` is according to the
  //        order of `instances`.
  for (const [, { quote: { symbol: code, latestPrice, change, changePercent, latestUpdate } }] of Object.entries(data)) {
    serializedData.push({
      code, latestPrice, change, changePercent, latestUpdate
    })
  }
  return serializedData
}

module.exports = { stocksDataFactory, getRawStocksData }

if (require.main === module) {
  /**
  * Gets executed when invoked directly.
  *
  * Can be used to check if rate limit
  * for the API has exceeded.
  */
  require('dotenv').config()
  const symbols = process.argv.length > 2 ? process.argv.slice(2) : ['GOOG']
  const instances = symbols.map((symbol) => ({ code: symbol }))
  stocksDataFactory(instances)
    .then(data => console.log(data))
    .catch(error => console.log(error))
  if (process.env.ARD === '1') { // ARD => API Raw Data
    getRawStocksData(symbols)
      .then(data => console.log(data))
      .catch(error => console.log(error))
  }
}
