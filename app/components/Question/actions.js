export const UPDATE_QUESTION = 'UPDATE_QUESTION'
export const updateQuestionState = (question) => {
  return {
    type: UPDATE_QUESTION,
    payload: question
  }
}
