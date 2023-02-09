import { Form, useTransition } from '@remix-run/react'
import type { ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { getUserSession, storage } from '~/utils/session.server'
import { Logo } from '~/components/Icon'
import Spinner from '~/components/Spinner'
import { cx } from '~/utils/common'
import { badRequest } from '~/utils/responses'
import { inputFromForm } from 'domain-functions'
import { setDifficultyData } from '~/domain/route-data.server'
import { QUESTIONS_COUNT } from '~/domain/quizz'

export function headers() {
  return {
    'Cache-Control': 'public maxage=86400',
  }
}

export async function action({ request }: ActionArgs) {
  const session = await getUserSession(request)
  const result = await setDifficultyData(await inputFromForm(request))
  if (!result.success) throw badRequest()

  session.set('difficulty', result.data.difficulty)
  session.set('slugs', result.data.slugs.slice(0, QUESTIONS_COUNT))
  session.set('userChoices', [])
  session.set('attemptedSlugsArray', [])

  return redirect(`/questions/${result.data.slugs.at(0)}`, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export default () => {
  const transition = useTransition()

  return (
    <main className="h-screen w-full bg-[url('/got-mobile-wallpaper.png')] bg-cover bg-center bg-no-repeat text-white lg:bg-[url('/got-desktop-wallpaper.png')]">
      <div className="mx-auto px-8 sm:w-4/5 sm:px-0">
        <div className="mx-auto h-auto w-72 pt-16 xl:w-96">
          <Logo color="white" />
        </div>
        <Form
          method="post"
          className="mt-[35vh] flex flex-col md:mx-auto md:w-fit"
        >
          <span className="text-xl">Select difficulty</span>

          <div>
            <input
              type="radio"
              name="difficulty"
              value="Easy"
              id="easy"
              defaultChecked
            />{' '}
            <label htmlFor="easy" className="ml-2 text-lg">
              Easy
            </label>
          </div>

          <div>
            <input
              type="radio"
              name="difficulty"
              value="Intermediate"
              id="intermediate"
            />{' '}
            <label htmlFor="intermediate" className="ml-2 text-lg">
              Intermediate
            </label>
          </div>

          <div>
            <input
              type="radio"
              name="difficulty"
              value="Legendary"
              id="legendary"
            />{' '}
            <label htmlFor="legendary" className="ml-2 text-lg">
              Legendary
            </label>
          </div>
          <button
            className={cx(
              'mt-4 grid h-12  w-32 place-items-center bg-gradient-to-b from-[#FF512F] to-[#F09819] text-black',
              transition.submission && 'pl-3',
            )}
          >
            {transition.submission ? <Spinner /> : 'Continue'}
          </button>
        </Form>
      </div>
    </main>
  )
}
