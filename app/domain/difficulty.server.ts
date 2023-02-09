import { makeDomainFunction } from 'domain-functions'
import { environment } from '~/environment.server'
import * as z from 'zod'
import { difficultySchema } from './difficulty'

const difficultyMap = new Map([
  ['Easy', environment().SANITY_DIFFICULTY_EASY],
  ['Intermediate', environment().SANITY_DIFFICULTY_INTERMEDIATE],
  ['Legendary', environment().SANITY_DIFFICULTY_LEGENDARY],
])

const getDifficultyReference = (difficulty: string) =>
  difficultyMap.get(difficulty) ?? null

const setDifficulty = makeDomainFunction(
  z.object({ difficulty: difficultySchema }),
)(async ({ difficulty }) => {
  return { difficulty }
})

export { difficultyMap, getDifficultyReference, setDifficulty }
