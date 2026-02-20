from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.authentication import BasicAuthentication
from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from django.http import JsonResponse
from django.conf import settings
import requests
from google import genai
from google.genai import types

from .models import Stock
from api.serializers import StockSerializer, UserSerializer, UserCreateSerializer, UserUpdateSerializer
from api.services.stock_service import (
    create_stock,
    get_stock_by_symbol,
    list_stocks,
    update_stock,
    delete_stock,
)
from api.services.user_service import (
    create_user,
    get_user_by_id,
    update_user_by_id,
    delete_user_by_id,
)
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GEMINI_KEY")

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
    client = genai.Client(api_key=GOOGLE_API_KEY)

    # Define investor prompt
    prompt = [
        types.Content(
            role="user", parts=[types.Part(text=f"Based on the stock ticker {ticker}, retrieve information from the following json response and use the information provided to highlight important information for potential investors to know. JSON response: {alphav_background}. Do not include asterisk or pound symbols and start your response with the phrasing: Based on the provided financial data for {ticker} here is a summary of the most important information for potential investors to consider.")]
        )
    ]

    # Send request with function declarations
    informed_response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
    )

    return JsonResponse({
        "summ_response": informed_response.text
    })

def search_stock(request):
    q = request.GET.get("q", "").strip()

    if not q:
        return JsonResponse({"query": q, "results": []}, status=400)

    url = "https://www.alphavantage.co/query"
    params = {
        "function": "SYMBOL_SEARCH",
        "keywords": q,
        "apikey": AV_KEY
    }

    r = requests.get(url, params=params, timeout=10)
    data = r.json()

    matches = data.get("bestMatches", [])

    results = []
    for m in matches:
        results.append({
            "symbol": m.get("1. symbol"),
            "name": m.get("2. name"),
            "type": m.get("3. type"),
            "region": m.get("4. region"),
            "marketOpen": m.get("5. marketOpen"),
            "marketClose": m.get("6. marketClose"),
            "timezone": m.get("7. timezone"),
            "currency": m.get("8. currency"),
            "matchScore": float(m.get("9. matchScore", 0)),
        })

    results.sort(key=lambda x: x["matchScore"], reverse=True)

    return JsonResponse({"query": q, "results": results})

def dev_stock_search(request):
    q = request.GET.get("q", "").strip()

    if not q:
        return JsonResponse({
            "query": q,
            "results": [],
            "error": "Missing query param: ?q="
        }, status=400)

    q_upper = q.upper()

    results = [
        {
            "symbol": q_upper,
            "name": f"{q_upper} Incorporated",
            "type": "Equity",
            "region": "United States",
            "marketOpen": "09:30",
            "marketClose": "16:00",
            "timezone": "UTC-04",
            "currency": "USD",
            "matchScore": 1.0,
        },
        {
            "symbol": f"{q_upper}X",
            "name": f"{q_upper} Growth Fund A",
            "type": "Mutual Fund",
            "region": "United States",
            "marketOpen": "09:30",
            "marketClose": "16:00",
            "timezone": "UTC-04",
            "currency": "USD",
            "matchScore": 0.88,
        },
        {
            "symbol": f"{q_upper}.LON",
            "name": f"1x {q_upper} Tracker ETP",
            "type": "ETF",
            "region": "United Kingdom",
            "marketOpen": "08:00",
            "marketClose": "16:30",
            "timezone": "UTC+01",
            "currency": "GBX",
            "matchScore": 0.80,
        },
        {
            "symbol": f"{q_upper}.TRT",
            "name": f"{q_upper} CDR (CAD Hedged)",
            "type": "Equity",
            "region": "Toronto",
            "marketOpen": "09:30",
            "marketClose": "16:00",
            "timezone": "UTC-05",
            "currency": "CAD",
            "matchScore": 0.72,
        },
        {
            "symbol": f"{q_upper}34.SAO",
            "name": f"{q_upper} Depositary Receipt",
            "type": "Equity",
            "region": "Brazil/Sao Paolo",
            "marketOpen": "10:00",
            "marketClose": "17:30",
            "timezone": "UTC-03",
            "currency": "BRL",
            "matchScore": 0.61,
        },
    ]

    return JsonResponse({
        "query": q,
        "results": results
    })

# STOCK CRUD
@api_view(["POST"])
def create_stock_view(request):
    stock = create_stock(**request.data)
    serializer = StockSerializer(stock)
    return Response(serializer.data, status=201)

@api_view(["GET"])
def get_stock_view(request, symbol):
    try:
        stock = get_stock_by_symbol(symbol)
    except ObjectDoesNotExist:
        return Response({"detail": "Stock not found"}, status=404)

    return Response(StockSerializer(stock).data)


@api_view(["GET"])
def list_stocks_view(request):
    stocks = list_stocks()
    serializer = StockSerializer(stocks, many=True)
    return Response(serializer.data)


@api_view(["PUT", "PATCH"])
def update_stock_view(request, symbol):
    try:
        stock = get_stock_by_symbol(symbol)
    except ObjectDoesNotExist:
        return Response({"detail": "Stock not found"}, status=404)

    stock = update_stock(stock, **request.data)
    return Response(StockSerializer(stock).data)


@api_view(["DELETE"])
def delete_stock_view(request, symbol):
    try:
        stock = get_stock_by_symbol(symbol)
    except ObjectDoesNotExist:
        return Response({"detail": "Stock not found"}, status=404)

    delete_stock(stock)
    return Response(status=204)



# USERS CRUD
@api_view(["POST"])
def register_user(request):
    serializer = UserCreateSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=201)

    return Response(serializer.errors, status=400)


@api_view(["GET"])
def get_user(request, user_id):
    try:
        user = get_user_by_id(user_id)
    except ObjectDoesNotExist:
        return Response({"detail": "User not found"}, status=404)

    return Response(
        UserSerializer(user).data
    )


@api_view(["PUT", "PATCH"])
def update_user(request, user_id):
    user = get_user_by_id(user_id)
    serializer = UserUpdateSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(user).data)

    return Response(serializer.errors, status=400)


@api_view(["DELETE"])
def delete_user(request, user_id):
    try:
        user = get_user_by_id(user_id)
    except ObjectDoesNotExist:
        return Response({"detail": "User not found"}, status=404)

    delete_user_by_id(user)
    return Response(status=204)
