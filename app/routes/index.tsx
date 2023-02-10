import { Link, useTransition } from '@remix-run/react'
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
