const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const cors = require('cors')
//var path = require('path')

var http = require('http').Server(app)
const errorHandler = require('./helpers/error-handler')
const jwt = require('./helpers/jwt')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
//app.use(jwt())

app.use('/acct', require('./accounts/accounts.controller'))
//app.use('/ord', require('./orders/orders.controller'))
app.use('/prod', require('./products/products.controller'))
//app.use('/pg', require('./pages/pages.controller'))

// Global error handler
app.use(errorHandler)

// Turn up web server
const port = 8088
http.listen(port, () => { console.log("Listening on port ",port)})
