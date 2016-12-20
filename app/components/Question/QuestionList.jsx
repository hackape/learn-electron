/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QuestionItem from './QuestionItem'

class QuestionList extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    const { questionIds } = this.props
    return (<div>
      {questionIds.map(questionId =>
        <QuestionItem key={`q_${questionId}`} questionId={questionId} />
      )}
    </div>)
  }
}

QuestionList.propTypes = {
  questionIds: PropTypes.array
}

export default connect(state => state)(QuestionList)
