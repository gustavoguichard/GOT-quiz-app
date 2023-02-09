import { environment } from '~/environment.server'
import type { Session } from '@remix-run/node'
import { redirect, createCookieSessionStorage } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { difficultySchema } from '~/domain/difficulty'
import * as z from 'zod'
//import { getClient } from "~/lib/sanity/getClient";

// Login logic
//
// Query Sanity for user with their email
// If there's no user, return null
// Use bcrypt.compare to compare the given password to the user's passwordHash
// If the passwords don't match return null
// If passwords match return the user

export async function login(email: string, password: string) {
  const query = `*[_type == 'user' && email == '${email}']{email, username, password, _id}`
  const queryUrl = 'https://n2tvwman.api.sanity.io/v1/data/query/production'
  const url = `${queryUrl}?query=${encodeURIComponent(query)}`
  const response = await fetch(url)
  const registeredUser = await response.json()

  if (registeredUser.result.length === 0) {
    return null
  }

  const isCorrectPassword = await bcrypt.compare(
    password,
    registeredUser.result[0].password,
  )

  if (!isCorrectPassword) {
    return null
  }
  return registeredUser.result[0]
}

export const storage = createCookieSessionStorage({
  cookie: {
    name: 'GOT_session',
    secure: true,
    secrets: [environment().SESSION_SECRET],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set('userId', userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function envFromSession(request: Request) {
  const session = await getUserSession(request)
  return session.data
}

export const sessionSchema = z.object({
  attemptedSlugsArray: z.array(z.string()).optional().default([]),
  difficulty: difficultySchema.optional(),
  numberOfQuestions: z.number().optional().default(10),
  slugs: z
    .array(z.object({ slug: z.object({ current: z.string() }) }))
    .optional()
    .default([]),
  userChoices: z
    .array(
      z.object({
        userChoice: z.string().nullable(),
        userQuestion: z.string(),
        userQuestionSlug: z.string(),
      }),
    )
    .optional()
    .default([]),
})
export type SessionData = z.infer<typeof sessionSchema>
export function getTypedSession(session: Session) {
  return sessionSchema.parse(session.data)
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'))
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}
