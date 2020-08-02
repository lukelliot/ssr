const fse = require('fs-extra')
const path = require('path')
const ejs = require('ejs')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const glob = require('glob')

const CONFIG = {
  ID: 'root'
}

function partitionHtml(html, id = CONFIG.ID) {
  const match = `(?<=<.*id=('|")${id}('|").*>).*(?=<\/.*>)`
  const regexp = new RegExp(match, 'm')
  const parts = html.split(regexp)
  return [parts[0], parts[parts.length - 1]]
}

function getReactStream(ReactComponent, props = {}) {
  const element = React.createElement(ReactComponent, props)
  return ReactDOMServer.renderToNodeStream(element)
}

function getComponent(name) {
  const files = glob.sync(path.join(CONFIG.PUBLIC_PATH, `${name}.module.*`))
  return require(files[0]).default
}

function getTemplatePath(name) {
  const files = glob.sync(path.join(CONFIG.PUBLIC_PATH, `${name}.app.*`))
  if (files.length <= 0) throw new Error('No template found')
  return files[0]
}

function sendReact(componentName, props = {}) {
  const ReactComponent = getComponent(componentName)
  const reactStream = getReactStream(ReactComponent, props)

  const template = getTemplatePath(componentName)
  const html = fse.readFileSync(template, { encoding: 'utf8' })

  const withProps = ejs.render(html, { props: JSON.stringify(props) })
  const [upperHtml, lowerHtml] = partitionHtml(withProps)

  this.write(upperHtml)
  reactStream.pipe(this, { end: false })
  reactStream.on('end', () => {
    this.write(lowerHtml)
    this.end()
  })

  reactStream.on('error', () => this.redirect('/404'))

  return this
}

function reactRenderMiddleware(options = {}) {
  if (!options.publicPath) throw new Error('Path to application directory required')

  CONFIG.PUBLIC_PATH = options.publicPath
  CONFIG.ID = options.id || CONFIG.ID

  return function (_, res, next) {
    res.sendReact = sendReact
    next()
  }
}

module.exports = {
  sendReact,
  reactRenderMiddleware
}

