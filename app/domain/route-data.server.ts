import { merge } from 'domain-functions'
import { setDifficulty } from './difficulty.server'
import { getQuestion, getRandomSlugs } from './questions.server'
import { getQuizzState } from './quizz.server'

const getQuestionData = merge(getQuizzState, getQuestion)
const setDifficultyData = merge(setDifficulty, getRandomSlugs)

export { getQuestionData, setDifficultyData }
