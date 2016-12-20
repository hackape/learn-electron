import { handleActions } from 'redux-actions'
import parser from '../components/FileReader/parser'
import latexFilter from '../components/FileReader/latexFilter'
import _ from 'lodash'

const reassignImgSrc = (text, imagePaths) => {
  return text ? text.replace(/\!\[img\]\{\"([^}]*)\"\}/g, function (m, p1) {
    return `<img src="${imagePaths[p1]}" />`
  }) : ''
}

const reassignImgSrcWithMD5 = (text, imageToMD5) => {
  return text ? text.replace(/<img src=\"([^\"]*)\" \/>/g, function (m, p1) {
    return `<img src="${imageToMD5[p1]}" />`
  }) : ''
}

export default handleActions({
  'UPDATE_FILES': (state, action) => {
    return {
      ...state,
      files: action.payload
    }
  },
  'PARSE_DOC': (state, action) => {
    const {text, imagePaths} = action.payload
    let parsedQuestions = parser.parse(text, imagePaths)
    if (parsedQuestions.length) {
      parsedQuestions = _.map(parsedQuestions, (question) => {
        _.forEach(question, (value, key) => {
          switch (key) {
            case 'content':
            case 'answer':
              question[key] = reassignImgSrc(latexFilter(value), imagePaths)
              break
            case 'analyze':
              question['analyze'] = value.map(each => {
                if (each.analysis) each.analysis = reassignImgSrc(latexFilter(each.analysis), imagePaths)
                if (each.analyze_content) {
                  each.analyze_content = each.analyze_content.map(analyze_content =>
                    reassignImgSrc(latexFilter(analyze_content), imagePaths)
                  )
                }
                return each
              })
              break
            case 'id':
            case 'knowledge_1':
            case 'knowledge_2':
            case 'type':
            case 'difficulty':
            case 'capacity_dimension':
            case 'estimates_time':
            case 'area':
            default:
              return
          }

        })
        return question
      })
    }

    let questions = parsedQuestions.reduce((acc, question) => {
      acc[question.id] = question
      return acc
    }, {})

    let questionIds = parsedQuestions.map(q => q.id)

    return {
      ...state,
      questionIds,
      questions,
      imagePaths,
    }
  },

  'REASSIGN_IMAGES_SOURCE' : (state, action) => {
    let imageToMD5 = action.payload
    let nextState = {...state}
    nextState.imageToMD5 = imageToMD5
    nextState.questions = _.reduce(state.questions, (acc, question) => {
      _.forEach(question, (value, key) => {
        switch (key) {
          case 'content':
          case 'answer':
            question[key] = reassignImgSrcWithMD5(value, imageToMD5)
            break
          case 'analyze':
            question['analyze'] = value.map(each => {
              if (each.analysis) each.analysis = reassignImgSrcWithMD5(each.analysis, imageToMD5)
              if (each.analyze_content) {
                each.analyze_content = each.analyze_content.map(analyze_content =>
                  reassignImgSrcWithMD5(analyze_content, imageToMD5)
                )
              }
              return each
            })
            break
          case 'id':
          case 'knowledge_1':
          case 'knowledge_2':
          case 'type':
          case 'difficulty':
          case 'capacity_dimension':
          case 'estimates_time':
          case 'area':
          default:
            return
        }
      })

      acc[question.id] = question
      return acc
    }, {})

    return nextState
  },

  'UPDATE_QUESTION': (state, action) => {
    let question = action.payload
    return {
      ...state,
      questions: {
        ...state.questions,
        [question.id]: question
      }
    }
  },

  'ACTIVE_QUESTION': (state, action) => {
    if (state.activeQuestionId === action.payload) return state
    return {
      ...state,
      activeQuestionId: action.payload
    }
  }
}, {questionIds: [], questions: {}, files: []})
