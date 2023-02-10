import { map, pipe, makeDomainFunction } from 'domain-functions'
import * as z from 'zod'
import { sessionSchema } from '~/utils/session.server'
import { getQuestions, questionSchema } from '.'

const userQAndA = makeDomainFunction(
  z.object({ questions: z.array(questionSchema) }),
  sessionSchema,
)(async ({ questions }, { userChoices }) => {
  return {
    results: userChoices.map(({ userChoice, userQuestion }) => {
      const matchedQuestion = questions.find(
        (question) => question._id === userQuestion,
      )!
      return { ...matchedQuestion, userChoice }
    }),
  }
})

const getUserResults = pipe(getQuestions, userQAndA)

const getResultsCount = map(getUserResults, ({ results }) => {
  const correctCount = results.filter(
    (result) => result.answer === result.userChoice,
  ).length
  return {
    answersCount: results.length,
    correctCount,
    percentage: Math.round((correctCount / results.length) * 100),
  }
})

export { getQuestions, getUserResults, getResultsCount }
