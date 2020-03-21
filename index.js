//-----------------------------------------------------------------------------
// index.js
//-----------------------------------------------------------------------------
require('./server/config/config')

const express       = require('express')
const bodyParser    = require('body-parser')

const mongoose      = require('./server/db/mongoose')
const morgan        = require('./server/config/morgan')
const logger        = require('./server/config/winston')
const accounts      = require('./server/routes/accounts')
const transactions  = require('./server/routes/transactions')

/*
 * main()
 */
const app = express()

app.use(bodyParser.json())

app.use(morgan(
  ':method :url :status :response-time ms - :res[content-length] - :req[content-length] - :body ',
  { stream: logger.stream, immediate: false }
))

app.use('/api', accounts)
app.use('/api', transactions)

const PORT = process.env.PORT
app.listen(PORT, () => {
  logger.info(`node-dough-app running on ${PORT}`)
})

// Export the app
module.exports = { app }
