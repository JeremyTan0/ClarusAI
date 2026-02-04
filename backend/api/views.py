from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
import requests
from google import genai
from google.genai import types

AV_KEY = settings.AV_KEY

def format_currency(value):
    if not value:
        return 'N/A'
    try:
        num = float(value)
        if num >= 1e12:
            return f"${num / 1e12:.2f}T"
        if num >= 1e9:
            return f"${num / 1e9:.2f}B"
        if num >= 1e6:
            return f"${num / 1e6:.2f}M"
        return f"${num:.2f}"
    except:
        return 'N/A'

def format_percent(value):
    if not value:
        return 'N/A'
    try:
        return f"{float(value) * 100:.2f}%"
    except:
        return 'N/A'

def format_price(value):
    if not value:
        return 'N/A'
    try:
        return f"${float(value):.2f}"
    except:
        return 'N/A'

def hello(request):
    return JsonResponse({"message": "Hello World!"})

def get_stock_info(request, ticker):
    url = f"https://www.alphavantage.co/query"
    ticker = ticker.upper()
    params = {
        "function": "OVERVIEW",
        "symbol": ticker,
        "apikey": AV_KEY
    }
    r = requests.get(url, params=params)
    data = r.json()
    print(data)
    return JsonResponse({
            "symbol": data.get("Symbol"),
            "asset_type": data.get("AssetType"),
            "name": data.get("Name"),
            "description": data.get("Description"),
            "exchange": data.get("Exchange") or "N/A",
            "currency": data.get("Currency") or "N/A",
            "country": data.get("Country") or "N/A",
            "sector": data.get("Sector") or "N/A",
            "industry": data.get("Industry") or "N/A",
            "address": data.get("Address") or "N/A",
            "website": data.get("OfficialSite") or "N/A",

            "market_cap": format_currency(data.get("MarketCapitalization")),
            "ebitda": format_currency(data.get("EBITDA")),
            "pe_ratio": data.get("PERatio") or "N/A",
            "peg_ratio": data.get("PEGRatio") or "N/A",
            "eps": format_price(data.get("EPS")),
            "book_value": format_price(data.get("BookValue")),

            "revenue_ttm": format_currency(data.get("RevenueTTM")),
            "gross_profit_ttm": format_currency(data.get("GrossProfitTTM")),

            "profit_margin": format_percent(data.get("ProfitMargin")),
            "operating_margin_ttm": format_percent(data.get("OperatingMarginTTM")),
            "return_on_assets": format_percent(data.get("ReturnOnAssetsTTM")),
            "return_on_equity": format_percent(data.get("ReturnOnEquityTTM")),

            "beta": data.get("Beta") or "N/A",
            "52_week_high": format_price(data.get("52WeekHigh")),
            "52_week_low": format_price(data.get("52WeekLow")),
            "50_day_moving_average": format_price(data.get("50DayMovingAverage")),
            "200_day_moving_average": format_price(data.get("200DayMovingAverage")),

            "analyst_rating_strong_buy": data.get("AnalystRatingStrongBuy"),
            "analyst_rating_buy": data.get("AnalystRatingBuy"),
            "analyst_rating_hold": data.get("AnalystRatingHold"),
            "analyst_rating_sell": data.get("AnalystRatingSell"),
            "analyst_rating_strong_sell": data.get("AnalystRatingStrongSell"),
            "analyst_target_price": data.get("AnalystTargetPrice")
        })

def dev_get_stock_info(request, ticker):
    ticker = ticker.upper().strip()

    dummy = {
        "symbol": ticker,
        "asset_type": "Common Stock",
        "name": f"{ticker} Corporation",
        "description": f"{ticker} is a publicly traded company used for development/testing.",
        "exchange": "NASDAQ",
        "currency": "USD",
        "country": "USA",
        "sector": "TECHNOLOGY",
        "industry": "SOFTWARE",
        "address": "123 DEV STREET, SAN FRANCISCO, CA, USA",
        "website": "https://example.com",

        "market_cap": "$1.58T",
        "ebitda": "$10.50B",
        "pe_ratio": "383.46",
        "peg_ratio": "6.44",
        "eps": "$1.10",
        "book_value": "$21.90",

        "revenue_ttm": "$94.83B",
        "gross_profit_ttm": "$17.09B",

        "profit_margin": "4.00%",
        "operating_margin_ttm": "4.70%",
        "return_on_assets": "2.10%",
        "return_on_equity": "4.93%",

        "beta": "1.887",
        "52_week_high": "$498.83",
        "52_week_low": "$214.25",
        "50_day_moving_average": "$443.58",
        "200_day_moving_average": "$377.22",

        "analyst_rating_strong_buy": "4",
        "analyst_rating_buy": "17",
        "analyst_rating_hold": "18",
        "analyst_rating_sell": "6",
        "analyst_rating_strong_sell": "2",
        "analyst_target_price": "418.81",
    }

    return JsonResponse(dummy)


def get_stock_background(ticker):
    url = f"https://www.alphavantage.co/query"
    params = {
        "function": "OVERVIEW",
        "symbol": ticker,
        "apikey": AV_KEY
    }
    r = requests.get(url, params=params)
    data = r.json()
    return data


def get_ai_response(request, ticker):

    # Define Alpha Vantage 
    alphav_background = get_stock_background(ticker)

    # Configure client and tools to make a call to gemini
    client = genai.Client()

    # Define investor prompt
    prompt = [
        types.Content(
            role="user", parts=[types.Part(text=f"Based on the stock ticker {ticker}, retrieve information from the following json response and use the information provided to highlight important information for potential investors to know. JSON response: {alphav_background}.")]
        )
    ]
    """print(prompt)"""

    # Send request with function declarations
    informed_response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
    )

    return JsonResponse({
        "response": informed_response.text
    })
