import { Link, useActionData } from '@remix-run/react'
import badRequest from '~/utils/badRequest'
import { createUserSession, login } from '~/utils/session.server'
import { validateEmail, validatePassword } from '~/utils/validation'

export async function action({ request }) {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const fields = { email, password }
  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  }
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields })
  }

  const user = await login(email, password)
  console.log(user)

  if (!user) {
    return badRequest({
      fields,
      formError: 'Username/Password combination is incorrect',
    })
  }
  return createUserSession(user._id, '/difficulty')
}

export function meta() {
  return {
    title: 'Log in',
    description: 'Log in to Game of Thrones quiz app',
  }
}
export default function Login() {
  const actionData = useActionData()
  console.log(actionData)

  return (
    <div className="grid  w-screen place-items-center outline">
      <h1 className="text-4xl">Login</h1>
      <form
        method="post"
        className="mb-4 max-w-xs rounded bg-white px-8 pt-6 pb-8  shadow-md"
      >
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
            placeholder="johndoe@gmail.com"
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
            Log In
          </button>
          <p>
            Don't have an account?{' '}
            <span className="text-blue-500 hover:underline hover:decoration-blue-500">
              <Link to="/register">Register here</Link>
            </span>
          </p>
        </div>
      </form>
      <p className="text-center text-xs text-gray-500">
        {new Date().getFullYear()} GOT Quiz. All rights reserved.
      </p>
    </div>
  )
}
