'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function stocks() {
    return (
        <div>
            <h2>Stocks Page</h2>
            <nav>
                <Link href="/">Home</Link>
                <Link href="/stocks">Stocks</Link>
                <Link href="/about">About</Link>
            </nav>
        </div>
    )
}