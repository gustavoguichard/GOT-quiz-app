import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { XIcon } from '~/components/Icon'
import { getUserSession } from '~/utils/session.server'

export async function loader({ request }) {
  const session = await getUserSession(request)
  const sessionDifficulty = session.get('difficulty')
  const userChoices = session.get('userChoices')

  let difficulty =
    sessionDifficulty === 'Easy'
      ? process.env.SANITY_DIFFICULTY_EASY
      : sessionDifficulty === 'Intermediate'
      ? process.env.SANITY_DIFFICULTY_INTERMEDIATE
      : sessionDifficulty === 'Legendary'
      ? process.env.SANITY_DIFFICULTY_LEGENDARY
      : null

  const questionsQuery = `*[_type == "question" && references('${difficulty}')]{question, answer, _id}`
  const questionsUrl = `${
    process.env.SANITY_QUERY_URL
  }?query=${encodeURIComponent(questionsQuery)}`

  const response = await fetch(questionsUrl)
  const questions = await response.json()

  return json({ userChoices, questions: questions.result })
}

export default function Results() {
  const { userChoices, questions } = useLoaderData()

  const qandA = userChoices.map((choice) => {
    let matchedQuestion = questions.find(
      (question) => question._id === choice.userQuestion,
    )
    matchedQuestion.userChoice = choice.userChoice
    return matchedQuestion
  })

  return (
    <div className="h-full bg-[#f8fbf8] px-8 py-3">
      <h2 className="font-semibold">Results</h2>
      <ol className="list-decimal">
        {qandA.map((question, index) => (
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
