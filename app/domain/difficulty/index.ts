import * as z from 'zod'

const difficultySchema = z.enum(['Easy', 'Intermediate', 'Legendary'])


type Difficulty = z.infer<typeof difficultySchema>

export type { Difficulty }
export { difficultySchema }
