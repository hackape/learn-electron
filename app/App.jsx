/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import FileReader from './components/FileReader'
import QuestionList from './components/Question'

class App extends Component {
  constructor (props) {
    super(props)
    window.MathJax.Hub.Config({skipStartupTypeset: true})
    window.MathJax.Hub.Configured()
  }

  render () {
    return (
      <div className='app-container container-fluid'>
        <FileReader />
        <QuestionList />
      </div>
    )
  }
}

export default App
