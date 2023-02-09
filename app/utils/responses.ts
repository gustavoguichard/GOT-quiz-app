import type { TypedResponse } from '@remix-run/node'
import { json } from '@remix-run/node'
import type { Result } from 'domain-functions'

function badRequest() {
  return new Response('Bad request', {
    status: 400,
  })
}

function loaderResponseOrThrow<T extends Result<unknown>>(
  result: T,
  opts?: RequestInit,
): T extends { data: infer X } ? TypedResponse<X> : never {
  if (!result.success) {
    throw new Response('There was an error fetching data', {
      status: 404,
    })
  }

  return json(result.data, { status: 200, ...opts }) as any
}

export { badRequest, loaderResponseOrThrow }
