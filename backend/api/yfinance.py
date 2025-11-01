import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt

# must either use ticker value or convert company name to ticker value
# can possibly use AI to search for ticker after user searches company name
microsoft = yf.Ticker("MSFT")
apple = yf.Ticker("AAPL")
tesla = yf.Ticker("TSLA")

# overall financial report or balance sheets can be retrieved about a stock
# to better inform the AI's response
print(microsoft.financials)
print(microsoft.balance_sheet)

# can provide dividend information if investor is looking into dividends
print(apple.dividends)

# info formatted in dictionary allows for picking specific return values easily
# if we want to give users standardized information alongside the AI summary
# print(tesla.info)
print(tesla.info["longBusinessSummary"])
print(tesla.info["regularMarketPrice"])
print(tesla.info["returnOnEquity"])
print(tesla.info["overallRisk"])

# can plot historical data about stocks to provide users with an interactive visual
# we can standardize the length of time we want to show, possibly the last five years
data = yf.download(["MSFT", "TSLA", "AAPL"], start="2020-01-01", end="2025-01-01")
data["Close"].plot(title="Closing of Prices Big 3")
plt.show()
