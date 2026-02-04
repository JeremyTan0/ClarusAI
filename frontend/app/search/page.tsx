'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/devstockSearch/?q=Tsla')
      .then(res => res.json())
      .then(json => setData(json))}, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-2xl font-bold mb-4">Raw JSON:</h1>

        <pre className="w-full text-sm bg-zinc-100 dark:bg-zinc-900 p-4 rounded overflow-auto">
          {data ? JSON.stringify(data, null, 2) : "Loading..."}
        </pre>
      </main>
    </div>
  )
}