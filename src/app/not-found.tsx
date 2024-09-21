import Link from 'next/link'
import React from 'react'

function PageNotFound() {
  return (
    <div>
        <h1>Page Not Found</h1>
    <Link href="/pages/mainpage">Go Back To the mainpage</Link>
    </div>
  )
}

export default PageNotFound