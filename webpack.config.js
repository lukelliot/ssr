const path = require('path');
const fse = require('fs-extra');
const glob = require('glob')

const webpackNodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { NODE_ENV } = process.env

const DIR = {
  OUTPUT: path.join(__dirname, 'server', 'build', 'apps'),
  ENTRY: path.join(__dirname, 'server', 'client', 'apps'),
  VIEWS: path.join(__dirname, 'server', 'views')
}

const moduleConfig = (pathToFile) => ({
  mode: NODE_ENV === 'production' ? 'production' : 'development',
  entry: pathToFile,
  output: {
    filename: path.basename(pathToFile),
    path: DIR.OUTPUT,
    libraryTarget: 'commonjs2'
  },
  externals: [webpackNodeExternals()],
  target: "node",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      }
    ]
  }
})

const browserConfig = (pathToFile) => ({
  mode: NODE_ENV === 'production' ? 'production' : 'development',
  entry: pathToFile,
  output: {
    filename: path.basename(pathToFile),
    path: DIR.OUTPUT,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: path.basename(pathToFile, '.hydrate.js'),
      filename: `${path.basename(pathToFile, '.hydrate.js')}.app.ejs`,
      template: path.join(DIR.VIEWS, `${path.basename(pathToFile, '.hydrate.js')}.ejs`),
      scriptLoading: 'defer',
    })
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      },
      {
        test: /\.ejs$/i,
        use: 'raw-loader',
      },
    ]
  }
})

function createReactWebpackConfigs(files) {
  return files.reduce((webpackConfigs, filePath) => {
    if (filePath.match(/.module./)) {
      return [...webpackConfigs, moduleConfig(filePath)]
    } else if (filePath.match(/.hydrate./)) {
      return [...webpackConfigs, browserConfig(filePath)]
    } else {
      return webpackConfigs
    }
  }, [])
}

const pathToReact = path.join(__dirname, 'server', 'client', 'apps', '*.+(module|hydrate).js')
const reactFiles = glob.sync(pathToReact)

module.exports = createReactWebpackConfigs(reactFiles)
