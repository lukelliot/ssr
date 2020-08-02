/**
 * DEPENDENCIES
 */
const express = require('express')
const path = require('path')


/**
 * INTERNAL LIBS
 */
const logFormat = require('./util/logFormat')
const { reactRenderMiddleware } = require('./middleware/reactRenderMiddleware')


/**
 * CONSTANTS
 */
const { ENVIRONMENT } = require('./constants')
const {
  PORT = 8080,
  ENV = ENVIRONMENT.DEVELOPMENT
} = process.env


/**
 * APPLICATION
 */
const app = express()

if (ENV === ENVIRONMENT.DEVELOPMENT) app.use(require('morgan')(logFormat))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(reactRenderMiddleware({ publicPath: path.join(__dirname, 'build', 'apps') }))


/**
 * PUBLIC DIRS
 */
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'build', 'apps')))


/**
 * ROUTES
 */
app.get('/', (req, res) => {
  return res.sendReact('Landing', { message: new Date().toString() })
})

app.get(/^4\d{2}$/, (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', '404.html'))
})

app.get(/^5\d{2}$/, (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', '500.html'))
})

app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m',
    `${new Date().toTimeString()} Server running on PORT: ${PORT}`
  )
})
