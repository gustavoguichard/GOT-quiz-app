import { Form, useTransition, useActionData } from '@remix-run/react'
import type { ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import badRequest from '~/utils/badRequest'
import { getUserSession, storage } from '~/utils/session.server'
import { Logo } from '~/components/Icon'
import Spinner from '~/components/Spinner'
import { environment } from '~/environment.server'

function validateDifficulty(choice: null | FormDataEntryValue) {
  if (choice === null) {
    return 'Select a level to continue'
  }
}

export function headers() {
  return {
    'Cache-Control': 'public maxage=86400',
  }
}

export async function action({ request }: ActionArgs) {
  // validation
  const formData = await request.formData()
  const difficulty = formData.get('difficulty')
  const difficultyFieldError = {
    name: validateDifficulty(difficulty),
  }

  if (Object.values(difficultyFieldError).some(Boolean)) {
    return badRequest({ difficultyFieldError })
  }

  const session = await getUserSession(request)
  session.set('difficulty', difficulty)

  let difficultyRefecence =
    difficulty === 'Easy'
      ? environment().SANITY_DIFFICULTY_EASY
      : difficulty === 'Intermediate'
      ? environment().SANITY_DIFFICULTY_INTERMEDIATE
      : difficulty === 'Legendary'
      ? environment().SANITY_DIFFICULTY_LEGENDARY
      : null

  // Fetch slugs according to the selected difficulty level and store them to the session
  const { SANITY_QUERY_URL: queryUrl } = environment()

  const questionSlugsQuery = `*[_type == 'question' && references('${difficultyRefecence}')]{slug{current}}`

  const questionSlugsUrl = `${queryUrl}?query=${encodeURIComponent(
    questionSlugsQuery,
  )}`

  const slugsResponse = await fetch(questionSlugsUrl)
  const fetchedSlugs = await slugsResponse.json()

  if (!fetchedSlugs) {
    throw new Response('There was an error fetching data', {
      status: 404,
    })
  }

  let firstTen = []

  for (let index = 0; index < 10; index++) {
    let randomIndex = Math.floor(Math.random() * fetchedSlugs.result.length)
    firstTen.push(fetchedSlugs.result[randomIndex])
    fetchedSlugs.result.splice(randomIndex, 1)
  }

  const numberOfQuestions = firstTen.length
  session.set('numberOfQuestions', numberOfQuestions)

  let slugIndex = Math.floor(Math.random() * firstTen.length)
  const firstQuestion = firstTen[slugIndex]

  const userQuestionsArray: string[] = []
  const attemptedSlugsArray: string[] = []

  session.set('slugs', firstTen)
  session.set('userChoices', userQuestionsArray)
  session.set('attemptedSlugsArray', attemptedSlugsArray)

  return redirect(`/questions/${firstQuestion.slug.current}`, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export default function Difficulty() {
  const transition = useTransition()
  const actionData = useActionData()

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
          {actionData?.difficultyFieldError?.name ? (
            <span className="text-red-500">
              {actionData.difficultyFieldError.name}
            </span>
          ) : null}
          <button
            className={`mt-4 grid h-12  w-32 place-items-center bg-gradient-to-b from-[#FF512F] to-[#F09819] text-black ${
              transition.submission ? 'pl-3' : ''
            }`}
          >
            {transition.submission ? <Spinner /> : 'Continue'}
          </button>
        </Form>
      </div>
    </main>
  )
}
