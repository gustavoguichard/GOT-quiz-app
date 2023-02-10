import type { LoaderArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { XIcon } from '~/components/Icon'
import { envFromSession } from '~/utils/session.server'
import { getUserResults } from '~/domain/questions.server'
import { loaderResponseOrThrow } from '~/utils/responses'

export async function loader({ request }: LoaderArgs) {
  const result = await getUserResults(null, await envFromSession(request))
  return loaderResponseOrThrow(result)
}

export default function Results() {
  const { results } = useLoaderData<typeof loader>()
  return (
    <div className="h-full bg-[#f8fbf8] px-8 py-3">
      <h2 className="font-semibold">Results</h2>
      <ol className="list-decimal">
        {results.map((question) => (
          <li key={question._id} className="my-3">
            <p>{question.question}</p>
            <div className="flex flex-wrap items-center gap-x-2 text-gray-500">
              <span>Your pick:</span>
              <span>{question.userChoice ?? '" "'}</span>
              {question.userChoice === question.answer ? (
                <span>✅</span>
              ) : (
                <XIcon />
              )}
            </div>
            <span className="italic text-green-500">
              {question.userChoice !== question.answer
                ? `Answer: ${question.answer}`
                : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
