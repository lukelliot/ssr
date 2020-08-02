const webpack = require('webpack')
const webpackConfig = require('../webpack.config')
const fs = require('fs')
const path = require('path')
const nodemon = require('nodemon')
const nodemonConfig = require('../nodemon.json')
const bsync = require('browser-sync').create('development')

const PORT = process.env.PORT || 8080

webpack(webpackConfig).watch(null, (err, stats) => {
  if (err) throw err

  console.log(stats.toString({ colors: true }))

  if (!nodemon.config.run) {
    nodemon({ ...nodemonConfig, script: 'server' })
      .on('start', () => {
        if (bsync.active) return bsync.reload()

        bsync.watch('*').on('change', bsync.reload)

        setTimeout(() => {
          bsync.init({
            proxy: `localhost:${PORT}`,
            port: PORT + 1,
          }, (err) => {
            if (err) console.error(err)
          })
        }, 500)
      })
      .on('quit', () => {
        console.log('Ending nodemon process...')
        process.exit()
      })
  }
})
