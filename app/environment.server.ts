import * as z from 'zod'

function environment() {
  const envSchema = z.object({
    SESSION_SECRET: z.string().min(1),
    SANITY_DIFFICULTY_EASY: z.string().min(1),
    SANITY_DIFFICULTY_INTERMEDIATE: z.string().min(1),
    SANITY_DIFFICULTY_LEGENDARY: z.string().min(1),
    SANITY_QUERY_URL: z.string().url(),
  })
  return envSchema.parse(process.env)
}

export { environment }
