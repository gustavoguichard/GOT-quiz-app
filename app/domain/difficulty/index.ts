import * as z from 'zod'

const difficultySchema = z.enum(['Easy', 'Intermediate', 'Legendary'])

const difficultyTimerMap = new Map<Difficulty, number>([
  ['Easy', 40],
  ['Intermediate', 30],
  ['Legendary', 20],
])

type Difficulty = z.infer<typeof difficultySchema>

export type { Difficulty }
export { difficultySchema, difficultyTimerMap }
