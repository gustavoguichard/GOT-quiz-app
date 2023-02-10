import { makeDomainFunction } from 'domain-functions'
import * as z from 'zod'
import { sanityQuery } from '~/services/sanity'
import { sessionSchema } from '~/utils/session.server'
import { difficultyMap } from '~/domain/difficulty.server'
import { difficultySchema } from '../difficulty'

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

const getQuestion = makeDomainFunction(
  z.object({ slug: z.string() }),
  sessionSchema,
)(async ({ slug }, { userChoices }) => {
  const questions = await sanityQuery(
    `*[_type == 'question' && slug.current == '${slug}']`,
    questionSchema,
  )
  const userChoice =
    userChoices.find(({ userQuestionSlug }) => userQuestionSlug === slug)
      ?.userChoice ?? null
  return {
    question: questions.at(0)!,
    userChoice,
  }
})

const getRandomSlugs = makeDomainFunction(
  z.object({ difficulty: difficultySchema }),
)(async ({ difficulty }) => {
  const difficultyRef = difficultyMap.get(difficulty)
  const slugs = await sanityQuery(
    `*[_type == 'question' && references('${difficultyRef}')]`,
    z.object({ slug: z.object({ current: z.string() }) }),
  )

  return {
    slugs: slugs
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value.slug.current),
  }
})

export { getQuestion, getQuestions, getRandomSlugs, questionSchema }
