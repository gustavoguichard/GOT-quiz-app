import { Form, Link, Outlet, useCatch, useLoaderData } from '@remix-run/react'
import type {
  ActionArgs,
  ErrorBoundaryComponent,
  LoaderArgs,
} from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Logo } from '~/components/Icon'
import { getUserSession, storage } from '~/utils/session.server'
import { environment } from '~/environment.server'

export function meta() {
  return {
    title: 'Results | Game of Thrones quiz',
  }
}

export async function loader({ request }: LoaderArgs) {
  const session = await getUserSession(request)
  const sessionDifficulty = session.get('difficulty')
  const userChoices = session.get('userChoices')

  let difficulty =
    sessionDifficulty === 'Easy'
      ? environment().SANITY_DIFFICULTY_EASY
      : sessionDifficulty === 'Intermediate'
      ? environment().SANITY_DIFFICULTY_INTERMEDIATE
      : sessionDifficulty === 'Legendary'
      ? environment().SANITY_DIFFICULTY_LEGENDARY
      : null

  const questionsQuery = `*[_type == "question" && references('${difficulty}')]{ answer, _id}`
  const questionsUrl = `${
    environment().SANITY_QUERY_URL
  }?query=${encodeURIComponent(questionsQuery)}`

  const response = await fetch(questionsUrl)
  const questions = await response.json()
  if (!questions) {
    throw new Response('There was an error fetching data', {
      status: 404,
    })
  }

  const correctAnswers = userChoices.map((userChoice: any) => {
    const matchedQuestions = questions.result.filter(
      (question: any) =>
        question._id === userChoice.userQuestion &&
        question.answer === userChoice.userChoice,
    )

    return matchedQuestions
  })

  return correctAnswers
}

export async function action({ request }: ActionArgs) {
  const session = await getUserSession(request)
  const formData = await request.formData()
  const action = formData.get('_action')

  if (action === 'clear') {
    return redirect('/difficulty', {
      headers: {
        'Set-Cookie': await storage.destroySession(session),
      },
    })
  }
  return null
}

export default function Success() {
  const data = useLoaderData()
  const correct = data.filter((q: any) => q.length !== 0)
  const percentage = Math.round((correct.length / data.length) * 100)

  return (
    <main className="mx-auto px-8 pb-16 text-gray-800 sm:w-4/5 sm:px-0 xl:max-w-4xl">
      <div>
        <div className="mx-auto mt-16 h-auto w-72">
          <Logo />
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-x-14">
          <div>
            <h1 className="mt-16 text-4xl font-bold lg:mt-28">Your score:</h1>
            <div className="flex items-center gap-x-5">
              <div className="h-40 w-40">
                <ProgressRing percentage={percentage} />
              </div>
              <div className="space-y-4">
                <span className="">
                  You got{' '}
                  <span className="font-semibold">{correct.length}</span> out of{' '}
                  <span className="font-semibold">{data.length}</span> questions
                  correct
                </span>
                <Link to="/success/results" className="block underline">
                  View results
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-44 w-44">
                <img src="/synchronize.svg" alt="" className="h-full w-full" />
              </div>
              <Form method="post" className="bg-black px-6 py-3 text-white">
                <button name="_action" value="clear">
                  Play again
                </button>
              </Form>
            </div>
          </div>
          <div className="mt-8 border border-slate-100 lg:mt-28">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  )
}

function ProgressRing({ percentage }: { percentage: number }) {
  const circumference = Math.PI * 45 * 2
  const dash = (percentage * circumference) / 100

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle
        className="text-gray-300"
        strokeWidth={5}
        stroke="currentColor"
        fill="transparent"
        r={45}
        cx={50}
        cy={50}
      />
      <circle
        className={`${
          percentage < 30
            ? 'text-red-500'
            : percentage > 30 && percentage < 60
            ? 'text-yellow-500'
            : 'text-green-600'
        }`}
        strokeWidth={5}
        strokeDasharray={[dash, circumference - dash] as any}
        transform={`rotate(-90 50 50)`}
        strokeLinecap="round"
        stroke="currentColor"
        fill={`${
          percentage < 30
            ? 'rgb(254 242 242)'
            : percentage > 30 && percentage < 60
            ? 'rgb(255 247 237)'
            : percentage > 60
            ? 'rgb(240 253 244)'
            : 'transparent'
        }`}
        r={45}
        cx={50}
        cy={50}
        style={{ transition: 'all 0.5s' }}
      />
      <text fill="black" x="50%" y="50%" dy="4px" dx="2px" textAnchor="middle">
        {percentage}%
      </text>
    </svg>
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
