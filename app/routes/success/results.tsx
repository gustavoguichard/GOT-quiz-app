import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { XIcon } from '~/components/Icon'
import { sanityQuery } from '~/services/sanity'
import { getUserSession } from '~/utils/session.server'
import * as z from 'zod'
import { getDifficultyReference } from '~/domain/difficulty'

export async function loader({ request }: LoaderArgs) {
  const session = await getUserSession(request)
  const sessionDifficulty = session.get('difficulty')
  const userChoices = session.get('userChoices')
  let difficulty = getDifficultyReference(sessionDifficulty)

  const questions = await sanityQuery(
    `*[_type == "question" && references('${difficulty}')]`,
    z.object({ answer: z.string(), _id: z.string(), question: z.string() }),
  )

  return json({ userChoices, questions })
}

export default function Results() {
  const { userChoices, questions } = useLoaderData<typeof loader>()

  const qandA = userChoices.map((choice: any) => {
    let matchedQuestion = questions.find(
      (question: any) => question._id === choice.userQuestion,
    )
    return { ...matchedQuestion, userChoice: choice.userChoice }
  })

  return (
    <div className="h-full bg-[#f8fbf8] px-8 py-3">
      <h2 className="font-semibold">Results</h2>
      <ol className="list-decimal">
        {qandA.map((question: any, index: number) => (
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
