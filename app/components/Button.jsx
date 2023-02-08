import { Link } from '@remix-run/react'

export default function Button({ text, href }) {
  return (
    <Link
      to={href}
      className="bg-gradient-to-b from-[#FF512F]  to-[#F09819] px-16 py-3 text-white"
    >
      {text}
    </Link>
  )
}
