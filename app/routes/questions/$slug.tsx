import {
  useLoaderData,
  Form,
  Link,
  useTransition,
  useCatch,
  useSubmit,
} from '@remix-run/react'
import type {
  LoaderArgs,
  ActionArgs,
  ErrorBoundaryComponent,
} from '@remix-run/node'
import { redirect, json } from '@remix-run/node'
import { useId, useRef, useState } from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { getUserSession, storage } from '~/utils/session.server'
import { ArrowLeftIcon, Logo } from '~/components/Icon'
import Spinner from '~/components/Spinner'

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
  const currentSlug = params.slug

  const questionQuery = `*[_type == 'question' && slug.current == '${currentSlug}']{question, choices, _id}`
  const questionQueryUrl = `${
    process.env.SANITY_QUERY_URL
  }?query=${encodeURIComponent(questionQuery)}`

  const response = await fetch(questionQueryUrl)
  const question = await response.json()

  if (!question) {
    throw new Response('There was an error fetching data', {
      status: 404,
    })
  }
  const session = await getUserSession(request)

  const numberOfQuestions = session.get('numberOfQuestions')
  const attemptedSlugsArray = session.get('attemptedSlugsArray')
  const userChoices = session.get('userChoices')
  const difficulty = session.get('difficulty')

  // This is used to set the current position in the questions e.g 1/10
  if (attemptedSlugsArray.includes(currentSlug)) {
    attemptedSlugsArray.pop()
  } else {
    attemptedSlugsArray.push(currentSlug)
  }

  session.set('attemptedSlugsArray', attemptedSlugsArray)

  const userChoice = userChoices.find(
    (element: any) => element.userQuestionSlug === currentSlug,
  )
  if (userChoice) {
    return json(
      {
        question: question.result,
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
      question: question.result,
      numberOfQuestions,
      attemptedSlugsArray,
      difficulty,
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
  const currentSlug = params.slug

  const formData = await request.formData()
  const userChoice = formData.get('choice')
  const userQuestion = formData.get('questionId')

  const session = await getUserSession(request)
  const slugs = session.get('slugs')

  const userQuestionsArray = session.get('userChoices')

  const currentSlugIndex = slugs.findIndex(
    (element: any) => element.slug.current === currentSlug,
  )

  if (currentSlugIndex !== -1) {
    slugs.splice(currentSlugIndex, 1)
  }

  const attemptedQuestionIndex = userQuestionsArray.findIndex(
    (element: any) => element.userQuestionSlug === currentSlug,
  )

  if (attemptedQuestionIndex !== -1) {
    userQuestionsArray.splice(attemptedQuestionIndex, 1)
  }

  const userChoiceObj = {
    userChoice,
    userQuestion,
    userQuestionSlug: currentSlug,
  }

  userQuestionsArray.push(userChoiceObj)
  session.set('userChoices', userQuestionsArray)

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
  } = useLoaderData()

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
          {question[0].choices.map((choice: any, index: number) => (
            <div key={index}>
              <RadioInput
                choice={choice}
                index={index}
                checkedState={checkedState}
                setCheckedState={setCheckedState}
                userChoice={userChoice?.userChoice}
              />{' '}
              <label htmlFor={String(index)} className="ml-2 text-lg">
                {choice}
              </label>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className={`relative mt-4 grid h-12 w-36 place-content-center bg-black text-white ${
            transition.submission ? 'pl-3' : ''
          }`}
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
  userChoice: string | undefined
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

export function CatchBoundary() {
  const caught = useCatch()
  return (
    <div className="grid h-screen w-full place-items-center bg-black bg-opacity-50 bg-[url('https://i.pinimg.com/originals/10/c7/ba/10c7badbea3bcd027b202f6134f8020c.jpg')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      <div className="text-white">
        <h1 className="text-4xl font-bold">Oops!!</h1>
        <p>Status: {caught.status}</p>
        <pre>
          <code>{caught.data}</code>
        </pre>
        <div className="mt-4 flex justify-center">
          <Link to="/difficulty" className="bg-white px-6 py-3 text-black">
            Try again
          </Link>
        </div>
      </div>
    </div>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.log({ error: error.message })
  return (
    <div className="grid h-screen w-full place-items-center bg-black bg-opacity-40 bg-[url('https://media1.popsugar-assets.com/files/thumbor/hD4DY5UeYUO_rmi7BbQw05P03vw/fit-in/2048xorig/filters:format_auto-!!-:strip_icc-!!-/2019/05/19/288/n/1922283/3c59feec5ce2412a2a2935.47224303__6_Courtesy_of_HBO/i/Why-Daenerys-Targaryen-Death-So-Damn-LAME.jpg')] bg-cover bg-center bg-no-repeat text-white bg-blend-overlay">
      <div>
        <h1 className="text-center text-4xl font-bold">
          Oops!! Something's not right
        </h1>
        <div className="mt-4 flex justify-center">
          <Link to="/difficulty" className="bg-white px-6 py-3 text-black">
            Try again
          </Link>
        </div>
      </div>
    </div>
  )
}
