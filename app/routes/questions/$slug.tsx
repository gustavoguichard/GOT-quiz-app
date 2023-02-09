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
import { getUserSession, storage } from '~/utils/session.server'
import { ArrowLeftIcon, Logo } from '~/components/Icon'
import Spinner from '~/components/Spinner'
import { cx } from '~/utils/common'
import { badRequest, loaderResponseOrThrow } from '~/utils/responses'
import { getQuestionData } from '~/domain/route-data.server'
import { difficultyTimerMap } from '~/domain/difficulty'
import { QUESTIONS_COUNT } from '~/domain/quizz'
import { inputFromForm } from 'domain-functions'
import { setUserChoice } from '~/domain/questions.server'

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
  const session = await getUserSession(request)
  const input = await inputFromForm(request)
  const result = await setUserChoice({ ...input, ...params }, session.data)
  if (!result.success) throw badRequest()

  session.set('userChoices', result.data.userChoices)
  session.set('slugs', result.data.slugs)

  return redirect(result.data.nextUrl, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export default () => {
  const { question, userChoice, attemptedCount, difficulty } =
    useLoaderData<typeof loader>()

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
        {attemptedCount} / {QUESTIONS_COUNT}
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
