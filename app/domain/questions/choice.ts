import { makeDomainFunction } from 'domain-functions'
import * as z from 'zod'
import { sessionSchema } from '~/utils/session.server'

function sample<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)] ?? null
}

const setUserChoice = makeDomainFunction(
  z.object({
    choice: z.string().optional(),
    questionId: z.string(),
    slug: z.string(),
  }),
  sessionSchema,
)(async ({ choice, questionId, slug }, { userChoices, slugs }) => {
  const newSlugs = slugs.filter((item) => slug !== item)
  const newUserChoices = userChoices.filter(
    ({ userQuestionSlug }) => slug !== userQuestionSlug,
  )
  const userChoice = {
    userChoice: choice ?? null,
    userQuestion: questionId,
    userQuestionSlug: slug,
  }
  const nextSlug = sample(newSlugs)
  return {
    nextUrl: nextSlug ? `/questions/${nextSlug}` : '/success',
    userChoices: [...newUserChoices, userChoice],
    slugs: newSlugs,
  }
})

export { setUserChoice }
