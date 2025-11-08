'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/hello/')
      .then(res => res.json())
      .then(data => setMessage(data.message))
  }, [])
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-2xl font-bold">{message}</h1>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/stocks">Stocks</Link>
          <Link href="/about">About</Link>
        </nav>
      </main>
    </div>
  );
}
