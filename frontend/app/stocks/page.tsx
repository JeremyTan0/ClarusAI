'use client'

import { useEffect, useState } from 'react'

type StockInfo = {
  symbol: string
  asset_type?: string
  name?: string
  description?: string
  exchange?: string
  currency?: string
  country?: string
  sector?: string
  industry?: string
  address?: string
  website?: string

  market_cap?: string
  ebitda?: string
  pe_ratio?: string
  peg_ratio?: string
  eps?: string
  book_value?: string

  revenue_ttm?: string
  gross_profit_ttm?: string

  profit_margin?: string
  operating_margin_ttm?: string
  return_on_assets?: string
  return_on_equity?: string

  beta?: string
  '52_week_high'?: string
  '52_week_low'?: string
  '50_day_moving_average'?: string
  '200_day_moving_average'?: string

  analyst_rating_strong_buy?: string
  analyst_rating_buy?: string
  analyst_rating_hold?: string
  analyst_rating_sell?: string
  analyst_rating_strong_sell?: string
  analyst_target_price?: string
}

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
      <div className="min-h-screen bg-black flex items-center justify-center p-0 m-0">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 m-0">
        <div className="max-w-xl w-full border border-red-500/30 bg-red-500/10 rounded-2xl p-6">
          <div className="text-red-300 font-semibold text-lg mb-2">Error</div>
          <div className="text-red-200 text-sm">{error}</div>
          <div className="text-gray-400 text-xs mt-4">
            Check Django is running + CORS enabled + endpoint correct.
          </div>
        </div>
      </div>
    )
  }

  if (!stockInfo?.symbol) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-0 m-0">
        <div className="text-white text-xl">No stock data found.</div>
      </div>
    )
  }

  // Website + favicon
  const website = cleanValue(stockInfo.website)
  let hostname: string | null = null

  try {
    hostname = website ? new URL(website).hostname.replace(/^www\./, '') : null
  } catch {
    hostname = null
  }

  // Calculate analyst rating distribution
  const strongBuy = parseInt(cleanValue(stockInfo.analyst_rating_strong_buy) || '0')
  const buy = parseInt(cleanValue(stockInfo.analyst_rating_buy) || '0')
  const hold = parseInt(cleanValue(stockInfo.analyst_rating_hold) || '0')
  const sell = parseInt(cleanValue(stockInfo.analyst_rating_sell) || '0')
  const strongSell = parseInt(cleanValue(stockInfo.analyst_rating_strong_sell) || '0')
  const totalRatings = strongBuy + buy + hold + sell + strongSell

  const ratingData = totalRatings > 0 ? [
    { label: 'Strong Buy', count: strongBuy, color: 'bg-green-500', percent: (strongBuy / totalRatings) * 100 },
    { label: 'Buy', count: buy, color: 'bg-green-400', percent: (buy / totalRatings) * 100 },
    { label: 'Hold', count: hold, color: 'bg-yellow-500', percent: (hold / totalRatings) * 100 },
    { label: 'Sell', count: sell, color: 'bg-red-400', percent: (sell / totalRatings) * 100 },
    { label: 'Strong Sell', count: strongSell, color: 'bg-red-500', percent: (strongSell / totalRatings) * 100 },
  ] : null

  return (
    <div className="min-h-screen bg-black text-white p-0 m-0">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with Company Info */}
        <div className="mb-8">
          <div className="flex items-start gap-5">
            {hostname && (
              <img
                src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=128`}
                alt={`${stockInfo.name || stockInfo.symbol} logo`}
                className="w-20 h-20 rounded-2xl border border-gray-800 bg-black flex-shrink-0"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold">
                {cleanValue(stockInfo.name) || stockInfo.symbol}
                {cleanValue(stockInfo.name) && (
                  <span className="text-gray-500 ml-3">({stockInfo.symbol})</span>
                )}
              </h1>
              
              {/* Company metadata */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-gray-500 mt-2">
                {cleanValue(stockInfo.exchange) && <span>{stockInfo.exchange}</span>}
                {cleanValue(stockInfo.sector) && <span>• {stockInfo.sector}</span>}
                {cleanValue(stockInfo.industry) && <span>• {stockInfo.industry}</span>}
                {cleanValue(stockInfo.country) && <span>• {stockInfo.country}</span>}
              </div>

              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors text-sm block mt-2"
                  style={{ paddingLeft: 0, marginLeft: 0 }}

                >
                  🌐 {website}
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {cleanValue(stockInfo.description) && (
            <p className="text-gray-400 leading-relaxed text-sm mt-4">
              {stockInfo.description}
            </p>
          )}
        </div>

        {/* Hero Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="border border-gray-800 rounded-xl bg-white/5 p-4">
            <div className="text-xs text-gray-500 mb-1">Market Cap</div>
            <div className="text-xl font-bold">{cleanValue(stockInfo.market_cap) ?? 'N/A'}</div>
          </div>

          <div className="border border-gray-800 rounded-xl bg-white/5 p-4">
            <div className="text-xs text-gray-500 mb-1">P/E Ratio</div>
            <div className="text-xl font-bold">{cleanValue(stockInfo.pe_ratio) ?? 'N/A'}</div>
          </div>

          <div className="border border-gray-800 rounded-xl bg-white/5 p-4">
            <div className="text-xs text-gray-500 mb-1">EPS</div>
            <div className="text-xl font-bold">{cleanValue(stockInfo.eps) ?? 'N/A'}</div>
          </div>

          <div className="border border-gray-800 rounded-xl bg-white/5 p-4">
            <div className="text-xs text-gray-500 mb-1">Beta</div>
            <div className="text-xl font-bold">{cleanValue(stockInfo.beta) ?? 'N/A'}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analyst Ratings */}
          {ratingData && (
            <div className="border border-gray-800 rounded-xl bg-white/5 p-5">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-lg font-semibold">Analyst Ratings</h3>
                <div className="text-sm text-gray-400">{totalRatings} analysts</div>
              </div>

              {cleanValue(stockInfo.analyst_target_price) && (
                <div className="mb-5 pb-5 border-b border-gray-800">
                  <div className="text-xs text-gray-500 mb-1">Target Price</div>
                  <div className="text-2xl font-bold">${stockInfo.analyst_target_price}</div>
                </div>
              )}

              <div className="space-y-3">
                {ratingData.map((rating) => (
                  rating.count > 0 && (
                    <div key={rating.label}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-300">{rating.label}</span>
                        <span className="text-gray-400">{rating.count}</span>
                      </div>
                      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${rating.color} transition-all`}
                          style={{ width: `${rating.percent}%` }}
                        />
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* 52 Week Range */}
          <div className="border border-gray-800 rounded-xl bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-4">Performance</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">52W Low</div>
                <div className="text-xl font-bold">{cleanValue(stockInfo['52_week_low']) ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">52W High</div>
                <div className="text-xl font-bold">{cleanValue(stockInfo['52_week_high']) ?? 'N/A'}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">50 Day MA</div>
                  <div className="text-lg font-semibold">{cleanValue(stockInfo['50_day_moving_average']) ?? 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">200 Day MA</div>
                  <div className="text-lg font-semibold">{cleanValue(stockInfo['200_day_moving_average']) ?? 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="border border-gray-800 rounded-xl bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-4">Financials (TTM)</h3>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">Revenue</div>
                <div className="font-semibold">{cleanValue(stockInfo.revenue_ttm) ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Gross Profit</div>
                <div className="font-semibold">{cleanValue(stockInfo.gross_profit_ttm) ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">EBITDA</div>
                <div className="font-semibold">{cleanValue(stockInfo.ebitda) ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Profit Margin</div>
                <div className="font-semibold">{cleanValue(stockInfo.profit_margin) ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Operating Margin</div>
                <div className="font-semibold">{cleanValue(stockInfo.operating_margin_ttm) ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">ROE</div>
                <div className="font-semibold">{cleanValue(stockInfo.return_on_equity) ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Valuation */}
          <div className="border border-gray-800 rounded-xl bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-4">Valuation</h3>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">PEG Ratio</div>
                <div className="font-semibold">{cleanValue(stockInfo.peg_ratio) ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Book Value</div>
                <div className="font-semibold">{cleanValue(stockInfo.book_value) ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">ROA</div>
                <div className="font-semibold">{cleanValue(stockInfo.return_on_assets) ?? 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>


      </main>
    </div>
  )
}