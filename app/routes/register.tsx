import { Link, useActionData } from '@remix-run/react'
import type { ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '~/utils/validation'
import { badRequest } from '~/utils/responses'

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const username = formData.get('username')
  const email = formData.get('email')
  const password = formData.get('password')

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    typeof email !== 'string'
  ) {
    return badRequest({ formError: 'Form not submitted correctly' })
  }

  let isEmailInUse = false

  const query = `*[_type == 'user' && email == '${email}']{email, username}`
  const queryUrl = 'https://n2tvwman.api.sanity.io/v1/data/query/production'
  const url = `${queryUrl}?query=${encodeURIComponent(query)}`
  const response = await fetch(url)
  const registerdUser = await response.json()

  console.log('Registered user: ', registerdUser)

  if (registerdUser.result.length !== 0) {
    isEmailInUse = true
  }

  const fields = { username, email, password }
  const fieldErrors = {
    username: validateUsername(username),
    email: validateEmail(email, isEmailInUse),
    password: validatePassword(password),
  }

  // Return errors if any
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const newUser = {
    mutations: [
      {
        create: {
          _type: 'user',
          username,
          email,
          password: passwordHash,
        },
      },
    ],
  }

  // Add user to Sanity
  const user = await fetch(
    `https://n2tvwman.api.sanity.io/v2021-03-25/data/mutate/production`,
    {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${process.env.SANITY_AUTH_TOKEN}`,
      },
      body: JSON.stringify(newUser),
    },
  )

  console.log(await user.json())

  return redirect('/difficulty')
}

export function meta() {
  return {
    title: 'Register',
    description: 'Register account for Game of Thrones quiz app',
  }
}

export default function Register() {
  const actionData = useActionData()

  return (
    <div className="grid  w-screen place-items-center outline">
      <h1 className="text-4xl">Register</h1>
      <form
        method="post"
        className="mb-4 max-w-xs rounded bg-white px-8 pt-6 pb-8  shadow-md"
      >
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-bold text-gray-700"
            htmlFor="username"
          >
            Username
          </label>
          <input
            className={`appearance-none shadow ${
              actionData?.fieldErrors?.username
                ? `outline outline-red-500`
                : `border`
            } w-full rounded py-2 px-3 leading-tight text-gray-700`}
            name="username"
            id="username"
            type="text"
            placeholder="John Doe"
            defaultValue={actionData?.fields?.username}
          />
          {actionData?.fieldErrors?.username ? (
            <p className="text-red-500">{actionData?.fieldErrors?.username}</p>
          ) : null}
        </div>
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-bold text-gray-700"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className={`appearance-none shadow ${
              actionData?.fieldErrors?.email
                ? `outline outline-red-500`
                : `border`
            } w-full rounded py-2 px-3 leading-tight text-gray-700`}
            name="email"
            id="email"
            type="email"
            placeholder="Email"
            defaultValue={actionData?.fields?.email}
          />
          {actionData?.fieldErrors?.email ? (
            <p className="text-red-500">{actionData?.fieldErrors?.email}</p>
          ) : null}
        </div>
        <div className="mb-6">
          <label
            className="mb-2 block text-sm font-bold text-gray-700"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className={`appearance-none shadow ${
              actionData?.fieldErrors?.password
                ? `outline outline-red-500`
                : `border`
            }  mb-3 w-full rounded py-2 px-3 leading-tight text-gray-700`}
            name="password"
            id="password"
            type="password"
            defaultValue={actionData?.fields?.password}
            placeholder="******************"
          />
          {actionData?.fieldErrors?.password ? (
            <p className="text-red-500">{actionData?.fieldErrors?.password}</p>
          ) : null}
        </div>
        <div className="">
          <div>
            {actionData?.formError ? (
              <p className="text-red-500">{actionData?.formError}</p>
            ) : null}
          </div>
          <button
            type="submit"
            className="focus:shadow-outline mb-4 w-full rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
          >
            Register
          </button>
          <p>
            Already have an account? <br />{' '}
            <span className="text-blue-500 hover:underline hover:decoration-blue-500">
              <Link to="/login">Log in here</Link>
            </span>{' '}
          </p>
        </div>
      </form>
      <p className="text-center text-xs text-gray-500">
        {new Date().getFullYear()} GOT Quiz. All rights reserved.
      </p>
    </div>
  )
}
