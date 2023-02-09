import { merge } from 'domain-functions'
import { getQuestion } from './questions.server'
import { getQuizzState } from './quizz.server'

const getQuestionData = merge(getQuizzState, getQuestion)

export { getQuestionData }
