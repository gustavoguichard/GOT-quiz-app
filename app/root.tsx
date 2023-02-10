import type { ErrorBoundaryComponent } from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from '@remix-run/react'
import styles from '~/styles/app.css'

export function meta() {
  return { title: 'Game of Thrones quiz' }
}
export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden font-body">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
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
