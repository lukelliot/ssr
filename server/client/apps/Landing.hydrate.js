import React from 'react'
import ReactDOM from 'react-dom'
import Landing from './Landing.module'

const props = window.__PROPS__ || {}

ReactDOM.hydrate(
  <Landing {...props} />,
  document.getElementById('root')
)
