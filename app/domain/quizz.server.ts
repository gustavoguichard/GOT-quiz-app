import { makeDomainFunction } from 'domain-functions'
import * as z from 'zod'
import { sessionSchema } from '~/utils/session.server'

const getQuizzState = makeDomainFunction(
  z.object({ slug: z.string() }),
  sessionSchema,
)(
  async (
    { slug },
    { numberOfQuestions, attemptedSlugsArray, difficulty = 'Easy' },
  ) => {
    const attemptedSet = new Set([...attemptedSlugsArray, slug])
    return {
      attemptedSlugsArray: Array.from(attemptedSet),
      attemptedCount: attemptedSet.size,
      difficulty,
      numberOfQuestions,
    }
  },
)

export { getQuizzState }
