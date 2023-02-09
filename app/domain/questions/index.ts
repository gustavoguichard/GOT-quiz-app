import { makeDomainFunction } from 'domain-functions'
import * as z from 'zod'
import { sanityQuery } from '~/services/sanity'
import { sessionSchema } from '~/utils/session.server'
import { difficultyMap } from '~/domain/difficulty.server'

const questionSchema = z.object({
  _id: z.string(),
  answer: z.string(),
  slug: z.object({ current: z.string() }),
  question: z.string(),
  choices: z.array(z.string()),
})

const getQuestions = makeDomainFunction(
  z.any(),
  sessionSchema,
)(async (_, { difficulty }) => {
  const difficultyRef = difficultyMap.get(difficulty!) ?? null
  const questions = await sanityQuery(
    `*[_type == "question" && references('${difficultyRef}')]`,
    questionSchema,
  )
  return { questions }
})


export { getQuestions, questionSchema }
