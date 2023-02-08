import { json } from '@remix-run/node'

export default function badRequest(data: unknown) {
  return json(data, { status: 400 })
}
