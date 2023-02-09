import {
  useLoaderData,
  Form,
  Link,
  useTransition,
  useSubmit,
} from '@remix-run/react'
import type { LoaderArgs, ActionArgs } from '@remix-run/node'
import { redirect, json } from '@remix-run/node'
import { useId, useRef, useState } from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import type { SessionData } from '~/utils/session.server'
import {
  getTypedSession,
  getUserSession,
  storage,
} from '~/utils/session.server'
import { ArrowLeftIcon, Logo } from '~/components/Icon'
import Spinner from '~/components/Spinner'
import { cx } from '~/utils/common'
import { sanityQuery } from '~/services/sanity'
import * as z from 'zod'

// Should I use useMatches instead?????🤔🤔
//
//
//
//
//
// Save slugs to the cookie session and cycle through them **DONE**✅
//
// Get a random slug from the session when next is clicked **DONE** ✅
//
// Check if the slug has been used. If so, remove it from the session ✅
//
// You can add a next question slug to a question in Sanity(Alternative way to load next question)
//
// Display a single question and it's choices✅
//
//
//
// Set the question and answer to session
// Navigate to the next question

export async function loader({ request, params }: LoaderArgs) {
  const question = await sanityQuery(
    `*[_type == 'question' && slug.current == '${params.slug}']`,
    z.object({
      _id: z.string(),
      choices: z.array(z.string()),
      question: z.string(),
    }),
  )

  if (!question) {
    throw new Response('There was an error fetching data', {
      status: 404,
    })
  }
  const session = await getUserSession(request)
  const { numberOfQuestions, attemptedSlugsArray, userChoices, difficulty } =
    getTypedSession(session)

  // This is used to set the current position in the questions e.g 1/10
  if (attemptedSlugsArray.includes(params.slug!)) {
    attemptedSlugsArray.pop()
  } else {
    attemptedSlugsArray.push(params.slug!)
  }

  session.set('attemptedSlugsArray', attemptedSlugsArray)

  const userChoice = userChoices.find(
    (element) => element.userQuestionSlug === params.slug,
  )
  if (userChoice) {
    return json(
      {
        question,
        numberOfQuestions,
        userChoice,
        attemptedSlugsArray,
        difficulty,
      },
      {
        headers: {
          'Set-Cookie': await storage.commitSession(session),
        },
      },
    )
  }

  return json(
    {
      question,
      numberOfQuestions,
      attemptedSlugsArray,
      difficulty,
      userChoice: null,
    },
    {
      headers: {
        'Cache-Control': 'private maxage=86400',
        'Set-Cookie': await storage.commitSession(session),
      },
    },
  )
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

export default function Question() {
  const {
    question,
    numberOfQuestions,
    userChoice,
    attemptedSlugsArray,
    difficulty,
  } = useLoaderData<typeof loader>()

  const transition = useTransition()

  const submit = useSubmit()

  const formRef = useRef(null)

  const [checkedState, setCheckedState] = useState<string>()

  const timerDuration =
    difficulty === 'Easy' ? 40 : difficulty === 'Intermediate' ? 30 : 20

  function handleSubmit() {
    submit(
      {
        questionId: question[0]._id,
      },
      { method: 'post' },
    )
  }

  return (
    <main className="mx-auto px-8 sm:w-4/5 sm:px-0 xl:max-w-4xl">
      <div className="mx-auto mt-16 h-auto w-72">
        <Logo />
      </div>
      <div className="absolute top-56 right-1/2 -z-10 h-72 w-72 rounded-full bg-[#FF512F] bg-opacity-50 blur-[140px]" />
      <Form
        method="post"
        className="flex flex-col"
        ref={formRef}
        key={question[0]._id}
      >
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
        <p className="mt-10 text-3xl ">{question[0].question}</p>
        <input type="hidden" value={question[0]._id} name="questionId" />
        <div className="mt-3">
          {question[0].choices.map((choice, index: number) => (
            <div key={index}>
              <RadioInput
                choice={choice}
                index={index}
                checkedState={checkedState}
                setCheckedState={setCheckedState}
                userChoice={userChoice?.userChoice ?? null}
              />{' '}
              <label htmlFor={String(index)} className="ml-2 text-lg">
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
        {attemptedSlugsArray.length} / {numberOfQuestions}
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

type RadioInputProps = {
  choice: string
  index: number
  checkedState?: string
  setCheckedState: (id: string) => void
  userChoice: SessionData['userChoices'][number]['userChoice']
}
function RadioInput({
  choice,
  index,
  checkedState,
  setCheckedState,
  userChoice,
}: RadioInputProps) {
  const id = useId()
  return (
    <input
      type="radio"
      name="choice"
      value={choice}
      id={String(index)}
      checked={checkedState === id || userChoice === choice}
      onChange={(e) => setCheckedState(id)}
    />
  )
}
