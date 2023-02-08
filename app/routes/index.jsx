import { Link, useCatch, useTransition } from '@remix-run/react'
import { Logo } from '../components/Icon'

export function headers() {
  return {
    'Cache-Control': 'maxage=86400 public',
  }
}

export default function Index() {
  const transition = useTransition()

  return (
    <main className="h-screen w-full bg-[url('/got-mobile-wallpaper.png')] bg-cover bg-center bg-no-repeat lg:bg-[url('/got-desktop-wallpaper.png')]">
      <div className="mx-auto h-full px-8 pt-8 sm:w-4/5 sm:px-0 ">
        <div className="mx-auto h-auto w-72 pt-16 xl:w-96">
          <Logo color="white" />
        </div>
        <div className="mt-[30vh]">
          <p className="text-center text-2xl text-white md:text-3xl lg:text-4xl landscape:mt-16">
            How well do you know Game of Thrones?
          </p>
          <div className="mt-4 flex justify-center lg:mt-8">
            <Link
              to="/difficulty"
              className="bg-gradient-to-b from-[#FF512F]  to-[#F09819] px-16 py-3 text-white"
            >
              {transition.state === 'loading' ? 'Processing...' : 'Start quiz'}
            </Link>
          </div>
        </div>
      </div>
    </main>
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

export function ErrorBoundary({ error }) {
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
