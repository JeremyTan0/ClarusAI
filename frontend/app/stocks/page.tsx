'use client'
import { useEffect, useState } from 'react'

export default function Stocks() {
    const [stockInfo, setStockInfo] = useState(null)
    const [loading, setLoading] = useState(true)

    // Placeholder URL during development
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/stockInfo/Tsla') 
            .then(res => res.json())
            .then(data => {
                setStockInfo(data)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <main className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold mb-2">{stockInfo?.symbol}</h1>
                    <p className="text-xl text-gray-400">{stockInfo?.name}</p>
                    {stockInfo?.website && (
                        <a href={stockInfo.website} target="_blank" rel="noopener noreferrer" 
                           className="text-gray-500 hover:text-white transition-colors">
                            {stockInfo.website}
                        </a>
                    )}
                </div>

                {/* Description */}
                {stockInfo?.description && (
                    <div className="mb-12 p-6 border border-gray-800 rounded-lg">
                        <p className="text-gray-300 leading-relaxed">{stockInfo.description}</p>
                    </div>
                )}
            </main>
        </div>
    )
}