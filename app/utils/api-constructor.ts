import type * as z from 'zod'
import { safeJoin } from './common'

const makeApiUrl =
  (basePath: string) => (path: string, options?: Record<string, any>) =>
    safeJoin('?', [
      `${basePath}${path}`,
      options ? new URLSearchParams(options).toString() : null,
    ])

type Options = Omit<RequestInit, 'body'> & {
  body?: unknown
  query?: Record<string, any>
}

function makeApi(basePath: string, baseHeaders?: HeadersInit) {
  const getApiUrl = makeApiUrl(basePath)
  return (path: string, options?: Options) => {
    const { query, ...opts } = options ?? {}
    const requestInit: RequestInit = {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...baseHeaders,
        ...opts?.headers,
      },
      method: opts?.method ?? 'GET',
      body: opts?.body ? JSON.stringify(opts.body) : undefined,
    }

    return {
      parse: async <T extends z.ZodTypeAny>(schema: T) => {
        const response = await fetch(getApiUrl(path, query), requestInit)
        if (!response.ok) {
          throw new Error(await response.text())
        }

        return schema.parse(await response.json()) as z.infer<typeof schema>
      },
    }
  }
}

export { makeApi, makeApiUrl }
