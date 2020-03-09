//-----------------------------------------------------------------------------
// index.js
//-----------------------------------------------------------------------------
require('./server/config/config')

const express     = require('express')
const bodyParser  = require('body-parser')

const mongoose    = require('./server/db/mongoose')
const accounts    = require('./server/routes/accounts')

/*
 * main()
 */
const app = express()


app.use(bodyParser.json())

app.use('/api', accounts)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`[INFO] node-dough-app running on ${PORT}`)
})
