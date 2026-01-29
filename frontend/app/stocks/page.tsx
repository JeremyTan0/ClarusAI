'use client'
import { useEffect, useState } from 'react'

export default function Stocks() {
    const [stockInfo, setStockInfo] = useState(null)
    const [loading, setLoading] = useState(true)

    // Placeholder URL during development
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/stockInfo/TSLA') 
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
                    <div className="flex items-center gap-4 mb-4">
                        {stockInfo?.website && (
                            <img 
                                src={`https://logo.clearbit.com/${new URL(stockInfo.website).hostname}`}
                                alt={`${stockInfo.name} logo`}
                                className="w-16 h-16 rounded-lg"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                        <div>
                            <h1 className="text-5xl font-bold">{stockInfo?.symbol}</h1>
                            <p className="text-xl text-gray-400">{stockInfo?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-gray-500">
                        {stockInfo?.country && stockInfo.country !== 'N/A' && (
                            <span className="flex items-center gap-2">
                                <span>{stockInfo.country}</span>
                            </span>
                        )}
                        {stockInfo?.exchange && stockInfo.exchange !== 'N/A' && (
                            <span>• {stockInfo.exchange}</span>
                        )}
                    </div>
                    {stockInfo?.website && (
                        <a href={stockInfo.website} target="_blank" rel="noopener noreferrer" 
                           className="text-gray-500 hover:text-white transition-colors text-sm">
                            {stockInfo.website}
                        </a>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {stockInfo?.market_cap && stockInfo.market_cap !== 'N/A' && (
                        <div className="p-4 border border-gray-800 rounded">
                            <div className="text-gray-500 text-sm mb-1">Market Cap</div>
                            <div className="text-lg font-semibold">{stockInfo.market_cap}</div>
                        </div>
                    )}
                    {stockInfo?.pe_ratio && stockInfo.pe_ratio !== 'N/A' && (
                        <div className="p-4 border border-gray-800 rounded">
                            <div className="text-gray-500 text-sm mb-1">P/E Ratio</div>
                            <div className="text-lg font-semibold">{stockInfo.pe_ratio}</div>
                        </div>
                    )}
                    {stockInfo?.sector && stockInfo.sector !== 'N/A' && (
                        <div className="p-4 border border-gray-800 rounded">
                            <div className="text-gray-500 text-sm mb-1">Sector</div>
                            <div className="text-lg font-semibold">{stockInfo.sector}</div>
                        </div>
                    )}
                    {stockInfo?.industry && stockInfo.industry !== 'N/A' && (
                        <div className="p-4 border border-gray-800 rounded">
                            <div className="text-gray-500 text-sm mb-1">Industry</div>
                            <div className="text-lg font-semibold">{stockInfo.industry}</div>
                        </div>
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