/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ContentEditable from 'react-contenteditable'
import { updateQuestionState } from './actions'

const QuestionItemForm = (props) => {
  const { question, editable, onChange } = props
  return (
    <form className='form-horizontal'>
      <div className='form-group'>
        <label className='col-xs-3'>【编号】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='id' {...props} />
        </div>
      </div>
      <div className='form-group'>
        <label className='col-xs-3'>【题干】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='content' {...props} />
        </div>
      </div>
      <div className='form-group'>
        <label className='col-xs-3'>【题型】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='type' {...props} />
        </div>
      </div>
      <div className='form-group'>
        <label className='col-xs-3'>【选项】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='option' {...props} />
        </div>
      </div>
      <div className='form-group'>
        <label className='col-xs-3'>【答案】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='answer' {...props} />
        </div>
      </div>

      {question.analyze && question.analyze.length ?
        question.analyze.map((analyzeObj, analyzeIdx) => [
          (<div className='form-group'>
            <label className='col-xs-3'>【分析】</label>
            <div className='col-xs-9'>
              <ContentDisplay keyName='analysis' {...props} analyzeIdx={analyzeIdx} />
            </div>
          </div>),
          (<div className='form-group'>
            <label className='col-xs-3'>【解析】</label>
            <div className='col-xs-9'>
              <ol>{analyzeObj.analyze_content.map((stepContent, idx) => (
                <li key={idx}>
                  <ContentDisplay keyName='analyze_content' {...props} step={idx} analyzeIdx={analyzeIdx} />
                </li>
              ))}</ol>
            </div>
          </div>)
        ])
      : null}

      <div className='form-group'>
        <label className='col-xs-3'>【主知点】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='knowledge_1' {...props} />
        </div>
      </div>
      <div className='form-group'>
        <label className='col-xs-3'>【副知点】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='knowledge_2' {...props} />
        </div>
      </div>
      <div className='form-group'>
        <label className='col-xs-3'>【难度】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='difficulty' {...props} />
        </div>
      </div>
      <div className='form-group'>
        <label className='col-xs-3'>【时间】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='estimates_time' {...props} />
        </div>
      </div>
      <div className='form-group'>
        <label className='col-xs-3'>【能力】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='capacity_dimension' {...props} />
        </div>
      </div>
      <div className='form-group'>
        <label className='col-xs-3'>【地区】</label>
        <div className='col-xs-9'>
          <ContentDisplay keyName='area' {...props} />
        </div>
      </div>
    </form>
  )
}

class QuestionItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      question: this.props.question,
      editable: false
    }
  }

  updateQuestion = (keyName, value, step, analyzeIdx) => {
    if (keyName === 'deduction') {
      let listValue = this.state.question[keyName]
      listValue[step] = value
      this.setState({ question: {...this.state.question, [keyName]: listValue} })
    } else if (analyzeIdx !== undefined) {
      let analyzeObjList = this.state.question['analyze']
      let analyzeObj = analyzeObjList[analyzeIdx]
      analyzeObjList = analyzeObjList.slice()
      if (keyName === 'analysis') {
        analyzeObj['analysis'] = value
      } else {
        analyzeObj['analyze_content'][step] = value
      }
      analyzeObjList[analyzeIdx] = analyzeObj
      this.setState({ question: {...this.state.question, analyze: analyzeObjList} })
    } else {
      this.setState({ question: {...this.state.question, [keyName]: value} })
    }
  }

  confirmQuestionEdit () {
    this.props.dispatch(updateQuestionState(this.state.question))
    this.setState({editable: false})
  }

  cancelQuestionEdit () {
    this.setState({question: this.props.question, editable: false})
  }

  render () {
    const { question } = this.state
    return (
    <div id={question.id} className={'question-item' + (this.props.isActive ? ' active': '')}>
      <div className='question-item-header'>
        <div className='edit-controls button-controls' ref={r=>this.header=r}>
          <div className='edit-controls-inner-container'>
            <div className='text-group'><strong>{ question.id }</strong></div>
            <div className='buttons-group'>
            {!this.state.editable
            ? <button className='btn btn-primary' onClick={e=>this.setState({editable: true})}>编辑</button>
            : <div>
              <button className='btn btn-success' onClick={e=>this.confirmQuestionEdit()}>保存</button>
              <button className='btn btn-default' onClick={e=>this.cancelQuestionEdit()}>取消</button>
              </div>
            }
            </div>
          </div>
        </div>
        {this.props.isActive
          ? <div className='edit-controls-placeholder'><div className='btn btn-default'>hold</div></div>
        : null}
      </div>

      <div className='row'>
        {this.state.editable ?
        <div className='col-xs-6'>
          <div className='edit'>
            <QuestionItemForm question={question} editable={true} updateQuestion={this.updateQuestion} />
          </div>
        </div>
        : null}

        <div className={this.state.editable ? 'col-xs-6' : 'col-xs-offset-2 col-xs-8'}>
          <div className='display' ref={c => this.element = c} id={'mj_'+question.id}>
            <QuestionItemForm question={question} editable={false} />
          </div>
        </div>
      </div>

    </div>)
  }

  componentDidMount () {
    window.MathJax.Hub.Queue(() => window.MathJax.Hub.Typeset(this.element.getAttribute('id')))
  }

  componentDidUpdate (prevProps, prevState) {
    window.MathJax.Hub.Queue(() => window.MathJax.Hub.Typeset(this.element.getAttribute('id')))
  }

  componentWillUpdate (nextProps) {
    this.state.question = nextProps.question
  }
}

let ContentDisplay = function ({imagePaths, question, keyName, editable, updateQuestion, step, analyzeIdx}) {
  let html
  if (analyzeIdx !== undefined) {
    if (keyName === 'analysis') html = question['analyze'][analyzeIdx]['analysis']
    if (keyName === 'analyze_content') html = question['analyze'][analyzeIdx]['analyze_content'][step]
  } else {
    html = question[keyName]
  }

  if (!editable) {
    if (typeof html === 'number') html = String(html)
    // let _html = html ? html.replace(/\!\[img\]\{\"([^}]*)\"\}/g, function (m, p1) {
    //   return `<img src="${imagePaths[p1]}" />`
    // }) : ''
    return (<ContentEditable className='content-display' html={html} disabled={true} />)
  } else {
    return (<ContentEditable className='content-display' html={html} onChange={e => updateQuestion(keyName, e.target.value, step, analyzeIdx)} />)
  }
}

ContentDisplay = connect(state => ({
  imagePaths: state.imagePaths
}))(ContentDisplay)


QuestionItem.propTypes = {
  question: PropTypes.object,
  isActive: PropTypes.bool
}

export default connect((state, ownProps) => {
  return {
    question: state.questions[ownProps.questionId],
    isActive: state.activeQuestionId === ownProps.questionId
  }
})(QuestionItem)
