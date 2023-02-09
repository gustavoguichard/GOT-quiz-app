import { environment } from '~/environment.server'

const difficultyMap = new Map([
  ['Easy', environment().SANITY_DIFFICULTY_EASY],
  ['Intermediate', environment().SANITY_DIFFICULTY_INTERMEDIATE],
  ['Legendary', environment().SANITY_DIFFICULTY_LEGENDARY],
])

const getDifficultyReference = (difficulty: string) =>
  difficultyMap.get(difficulty) ?? null

export { difficultyMap, getDifficultyReference }
