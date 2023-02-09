import * as z from 'zod'
import { environment } from '~/environment.server'

const difficultySchema = z.enum(['Easy', 'Intermediate', 'Legendary'])

const difficultyMap = new Map([
  ['Easy', environment().SANITY_DIFFICULTY_EASY],
  ['Intermediate', environment().SANITY_DIFFICULTY_INTERMEDIATE],
  ['Legendary', environment().SANITY_DIFFICULTY_LEGENDARY],
])

const getDifficultyReference = (difficulty: string) =>
  difficultyMap.get(difficulty) ?? null

type Difficulty = z.infer<typeof difficultySchema>

export type { Difficulty }
export { difficultySchema, difficultyMap, getDifficultyReference }
