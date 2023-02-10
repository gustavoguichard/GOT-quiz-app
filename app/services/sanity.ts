import { environment } from '~/environment.server'
import { makeApi } from '~/utils/api-constructor'
import * as z from 'zod'

const sanityFetch = makeApi(environment().SANITY_QUERY_URL)
const sanityQuery = <T extends z.AnyZodObject>(query: string, schema: T) => {
  return sanityFetch('', {
    query: { query: `${query}{${Object.keys(schema.shape).join(',')}}` },
  }).parse(
    z
      .object({
        result: z.array(schema),
      })
      .transform(({ result }) => result),
  )
}

export { sanityQuery }
