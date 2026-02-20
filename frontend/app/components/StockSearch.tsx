'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type StockResult = {
  symbol: string
  name: string
  exchange: string
  type?: string
  region?: string
  currency?: string
  matchScore?: number
}

// ─── Mock data (used when backend is off or unreachable) ──────────────────────

const MOCK_STOCKS: StockResult[] = [
  { symbol: 'AAPL',  name: 'Apple Inc.',                     exchange: 'NASDAQ' },
  { symbol: 'MSFT',  name: 'Microsoft Corporation',          exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',                  exchange: 'NASDAQ' },
  { symbol: 'GOOG',  name: 'Alphabet Inc. Class C',          exchange: 'NASDAQ' },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',                exchange: 'NASDAQ' },
  { symbol: 'TSLA',  name: 'Tesla Inc.',                     exchange: 'NASDAQ' },
  { symbol: 'META',  name: 'Meta Platforms Inc.',            exchange: 'NASDAQ' },
  { symbol: 'NVDA',  name: 'NVIDIA Corporation',             exchange: 'NASDAQ' },
  { symbol: 'AMD',   name: 'Advanced Micro Devices Inc.',    exchange: 'NASDAQ' },
  { symbol: 'INTC',  name: 'Intel Corporation',              exchange: 'NASDAQ' },
  { symbol: 'NFLX',  name: 'Netflix Inc.',                   exchange: 'NASDAQ' },
  { symbol: 'PYPL',  name: 'PayPal Holdings Inc.',           exchange: 'NASDAQ' },
  { symbol: 'CRM',   name: 'Salesforce Inc.',                exchange: 'NYSE'   },
  { symbol: 'JPM',   name: 'JPMorgan Chase & Co.',           exchange: 'NYSE'   },
  { symbol: 'V',     name: 'Visa Inc.',                      exchange: 'NYSE'   },
  { symbol: 'MA',    name: 'Mastercard Incorporated',        exchange: 'NYSE'   },
  { symbol: 'JNJ',   name: 'Johnson & Johnson',              exchange: 'NYSE'   },
  { symbol: 'WMT',   name: 'Walmart Inc.',                   exchange: 'NYSE'   },
  { symbol: 'BAC',   name: 'Bank of America Corp.',          exchange: 'NYSE'   },
  { symbol: 'PG',    name: 'Procter & Gamble Co.',           exchange: 'NYSE'   },
  { symbol: 'DIS',   name: 'The Walt Disney Company',        exchange: 'NYSE'   },
  { symbol: 'UBER',  name: 'Uber Technologies Inc.',         exchange: 'NYSE'   },
  { symbol: 'COIN',  name: 'Coinbase Global Inc.',           exchange: 'NASDAQ' },
  { symbol: 'SPOT',  name: 'Spotify Technology S.A.',        exchange: 'NYSE'   },
  { symbol: 'SNAP',  name: 'Snap Inc.',                      exchange: 'NYSE'   },
]

function filterMockStocks(query: string): StockResult[] {
  const q = query.toLowerCase()
  return MOCK_STOCKS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q),
  )
}

// ─── Environment ──────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// ─── Component ────────────────────────────────────────────────────────────────

export default function StockSearch() {
  const [query, setQuery]             = useState('')
  const [suggestions, setSuggestions] = useState<StockResult[]>([])
  const [results, setResults]         = useState<StockResult[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showDropdown, setShowDropdown] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const inputRef    = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const abortRef    = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Core search function ───────────────────────────────────────────────────

  const search = useCallback(async (q: string) => {
    // Cancel any previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      let fetched: StockResult[] = []

      if (BASE_URL) {
        // Backend ON — try real API, fall back to mock on any failure
        try {
          const res = await fetch(
            `${BASE_URL}/api/search?q=${encodeURIComponent(q)}`,
            { signal: controller.signal },
          )
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          // Accept either { results: [...] } or a bare array
          fetched = Array.isArray(json) ? json : (json.results ?? [])
        } catch (err: unknown) {
          // Abort means a newer request superseded this one — bail silently
          if (err instanceof Error && err.name === 'AbortError') return
          // Any other failure → graceful mock fallback
          fetched = filterMockStocks(q)
          setError('Using offline data — backend unreachable')
        }
      } else {
        // Backend OFF — always use mock
        fetched = filterMockStocks(q)
      }

      setSuggestions(fetched)
      setShowDropdown(true)
      setActiveIndex(-1)
    } finally {
      // Always clear loading state, even on abort or error
      setLoading(false)
    }
  }, [])

  // ─── Debounce input changes ─────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      // Cancel any in-flight request when query becomes too short
      if (abortRef.current) abortRef.current.abort()
      setLoading(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      search(query)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  // ─── Close dropdown on outside click ───────────────────────────────────────

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // ─── Keyboard scroll-into-view for highlighted suggestion ──────────────────

  useEffect(() => {
    if (activeIndex < 0 || !dropdownRef.current) return
    const item = dropdownRef.current.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // ─── Actions ────────────────────────────────────────────────────────────────

  const selectSuggestion = (stock: StockResult) => {
    setQuery(`${stock.symbol} – ${stock.name}`)
    setResults([stock])
    setSuggestions([])
    setShowDropdown(false)
    setHasSearched(true)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectSuggestion(suggestions[activeIndex])
        } else if (suggestions.length > 0) {
          selectSuggestion(suggestions[0])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setActiveIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      selectSuggestion(suggestions[activeIndex])
    } else if (suggestions.length > 0) {
      selectSuggestion(suggestions[0])
    }
  }

  // ─── Derived UI state ───────────────────────────────────────────────────────

  const isIdle       = query.length < 2 && !hasSearched && !loading
  const showNoResult = hasSearched && !loading && results.length === 0

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-2xl mx-auto px-4 py-16">

        {/* Page header */}
        <h1 className="text-3xl font-bold mb-1">Stock Search</h1>
        <p className="text-gray-500 text-sm mb-8">
          Search by ticker symbol or company name
        </p>

        {/* Mode indicator (dev convenience) */}
        <div className="inline-flex items-center gap-1.5 mb-6 px-2.5 py-1 rounded-full border text-xs
          border-gray-700 text-gray-500">
          <span className={`w-1.5 h-1.5 rounded-full ${BASE_URL ? 'bg-green-500' : 'bg-yellow-500'}`} />
          {BASE_URL ? 'API mode' : 'Offline / mock mode'}
        </div>

        {/* ── Search form ── */}
        <form onSubmit={handleSubmit} className="relative mb-8" autoComplete="off">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (hasSearched) setHasSearched(false)
                setResults([])
                setError(null)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true)
              }}
              placeholder="e.g. AAPL or Apple…"
              className="w-full bg-zinc-900 border border-gray-700 rounded-xl px-4 py-3 pr-12
                text-white placeholder-gray-600 focus:outline-none focus:border-gray-400
                transition-colors"
              aria-label="Stock search"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={showDropdown}
              aria-activedescendant={
                activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
              }
            />

            {/* Spinner — only visible while a request is in progress */}
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Autocomplete / typeahead dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <ul
              id="search-suggestions"
              ref={dropdownRef}
              role="listbox"
              aria-label="Stock suggestions"
              className="absolute z-50 mt-1 w-full bg-zinc-900 border border-gray-700 rounded-xl
                overflow-hidden shadow-2xl max-h-72 overflow-y-auto"
            >
              {suggestions.map((stock, i) => (
                <li
                  id={`suggestion-${i}`}
                  key={stock.symbol}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={(e) => {
                    // Prevent input blur before click registers
                    e.preventDefault()
                    selectSuggestion(stock)
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors
                    ${i !== suggestions.length - 1 ? 'border-b border-gray-800' : ''}
                    ${i === activeIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-semibold text-white shrink-0">{stock.symbol}</span>
                    <span className="text-gray-400 text-sm truncate">{stock.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-3 shrink-0">{stock.exchange}</span>
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Non-blocking error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-2.5 border border-yellow-500/30 bg-yellow-500/10
            rounded-xl px-4 py-3">
            <span className="text-yellow-400 text-sm shrink-0">⚠</span>
            <span className="text-yellow-300 text-sm">{error}</span>
          </div>
        )}

        {/* ── Results area ── */}
        <section aria-live="polite" aria-label="Search results">

          {/* Idle state */}
          {isIdle && (
            <div className="text-center text-gray-600 py-20">
              <div className="text-5xl mb-4 select-none">&#128269;</div>
              <p className="text-base">Type to search&hellip;</p>
              <p className="text-sm mt-1 text-gray-700">Enter at least 2 characters</p>
            </div>
          )}

          {/* No results */}
          {showNoResult && (
            <div className="text-center text-gray-500 py-20">
              <div className="text-5xl mb-4 select-none">&#128202;</div>
              <p className="text-base">No results found</p>
              <p className="text-sm mt-1 text-gray-600">
                Try a different ticker or company name
              </p>
            </div>
          )}

          {/* Results list */}
          {results.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Selected
              </p>
              <div className="space-y-2">
                {results.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="border border-gray-800 rounded-xl bg-white/5 px-5 py-4
                      flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{stock.symbol}</span>
                        <span className="text-gray-400 text-sm truncate">{stock.name}</span>
                      </div>
                      {stock.exchange && (
                        <div className="text-xs text-gray-600 mt-1">{stock.exchange}</div>
                      )}
                    </div>
                    {stock.type && (
                      <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-full shrink-0">
                        {stock.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}