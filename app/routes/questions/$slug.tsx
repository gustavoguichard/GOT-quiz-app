import {
  useLoaderData,
  Form,
  Link,
  useTransition,
  useSubmit,
} from '@remix-run/react'
import type { LoaderArgs, ActionArgs } from '@remix-run/node'
import { redirect, json } from '@remix-run/node'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import {
  getTypedSession,
  getUserSession,
  storage,
} from '~/utils/session.server'
import { ArrowLeftIcon, Logo } from '~/components/Icon'
import Spinner from '~/components/Spinner'
import { cx } from '~/utils/common'
import { loaderResponseOrThrow } from '~/utils/responses'
import { getQuestionData } from '~/domain/route-data.server'
import { difficultyTimerMap } from '~/domain/difficulty'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getUserSession(request)
  const result = await getQuestionData(params, session.data)
  if (!result.success) return loaderResponseOrThrow(result)

  session.set('attemptedSlugsArray', result.data.attemptedSlugsArray)
  return json(result.data, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const userChoice = formData.get('choice')
  const userQuestion = formData.get('questionId')

  const session = await getUserSession(request)
  const { slugs, userChoices } = getTypedSession(session)

  const currentSlugIndex = slugs.findIndex(
    (element) => element.slug.current === params.slug,
  )

  if (currentSlugIndex !== -1) {
    slugs.splice(currentSlugIndex, 1)
  }

  const attemptedQuestionIndex = userChoices.findIndex(
    (element) => element.userQuestionSlug === params.slug,
  )

  if (attemptedQuestionIndex !== -1) {
    userChoices.splice(attemptedQuestionIndex, 1)
  }

  const userChoiceObj = {
    userChoice: userChoice as string,
    userQuestion: userQuestion as string,
    userQuestionSlug: params.slug!,
  }

  userChoices.push(userChoiceObj)
  session.set('userChoices', userChoices)

  //////////////////////////////////////////////////////////////////////////////////

  // Get a slug from the session at random and delete it after being used so that it doesn't repeat
  // Redirect to  results page after the last question

  if (slugs.length === 0) {
    return redirect('/success', {
      headers: {
        'Set-Cookie': await storage.commitSession(session),
      },
    })
  }
  let slugIndex = Math.floor(Math.random() * slugs.length)
  let nextSlug = slugs[slugIndex].slug.current

  session.set('slugs', slugs)

  return redirect(`/questions/${nextSlug}`, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export default () => {
  const {
    question,
    numberOfQuestions,
    userChoice,
    attemptedCount,
    difficulty,
  } = useLoaderData<typeof loader>()

  const transition = useTransition()
  const submit = useSubmit()

  const timerDuration = difficultyTimerMap.get(difficulty)!

  function handleSubmit() {
    submit({ questionId: question._id }, { method: 'post' })
  }

  return (
    <main className="mx-auto px-8 sm:w-4/5 sm:px-0 xl:max-w-4xl">
      <div className="mx-auto mt-16 h-auto w-72">
        <Logo />
      </div>
      <div className="absolute top-56 right-1/2 -z-10 h-72 w-72 rounded-full bg-[#FF512F] bg-opacity-50 blur-[140px]" />
      <Form method="post" className="flex flex-col" key={question._id}>
        <div className="mt-10">
          <CountdownCircleTimer
            isPlaying
            duration={timerDuration}
            colors={['#16a34a', '#F7B801', '#dbb239', '#FF5349']}
            colorsTime={[
              timerDuration,
              0.4 * timerDuration,
              0.75 * timerDuration,
              0,
            ]}
            size={100}
            strokeWidth={6}
            onComplete={handleSubmit}
          >
            {({ remainingTime }) => remainingTime}
          </CountdownCircleTimer>
        </div>
        <p className="mt-10 text-3xl ">{question.question}</p>
        <input type="hidden" value={question._id} name="questionId" />
        <div className="mt-3">
          {question.choices.map((choice, index: number) => (
            <div key={index}>
              <input
                type="radio"
                name="choice"
                value={choice}
                id={choice}
                defaultChecked={userChoice === choice}
              />{' '}
              <label htmlFor={choice} className="ml-2 text-lg">
                {choice}
              </label>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className={cx(
            'relative mt-4 grid h-12 w-36 place-content-center bg-black text-white',
            transition.submission && 'pl-3',
          )}
        >
          {transition.submission ? <Spinner /> : 'Next'}
        </button>
      </Form>
      <span className="mt-4 flex justify-center">
        {attemptedCount} / {numberOfQuestions}
      </span>
      <div className="mt-8 flex gap-2">
        <ArrowLeftIcon />{' '}
        <Link to="/difficulty" className="hover:underline">
          Choose difficulty
        </Link>
      </div>
      <span className="italic text-gray-700">
        Current difficulty level:{' '}
        <span className="font-semibold">{difficulty}</span>
      </span>
    </main>
  )
}
