// @flow
require('babel-register')
const React = require('react');
const { connect, Provider } = require('react-redux');
const { render } = require('react-dom');

const App = require('./App');
const configureStore = require('./store/configureStore.js');

let defaultState = {
  questionIds: [],
  questions: {},
  files: []
};

// $(document).on('scroll', function (e) {
//   const questionItems = $('.question-item');
//   const len = questionItems.length;
//   let curActiveQuestion = {id: ''};
//   for (let i=0; i < len; i++) {
//     let q = questionItems[i];
//     let rect = q.getBoundingClientRect();
//     const {top, bottom} = rect;
//     if (top <= 0 && bottom > 0) {
//       curActiveQuestion = q;
//       break;
//     }
//   }

//   store.dispatch({type: 'ACTIVE_QUESTION', payload: curActiveQuestion.id});
// })

const store = configureStore(defaultState);

const Root = (props) => (<Provider store={store} ><App /></Provider>)
const app = React.createElement(Root)
render(app, document.getElementById('root'))
