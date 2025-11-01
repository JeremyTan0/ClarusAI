from massive import RESTClient
import json
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

client = RESTClient(api_key="RrOAOpakB896gYNTTO2OCyGn62qo6sNK")

# also requires the use of tickers
apple = "AAPL"
microsoft = "MSFT"
tesla = "TSLA"

# retrieval of balance sheet is more specified (can be quarterly or annual)
# returns a json response with dictionary held in "results" field
apple_balance = client.list_financials_balance_sheets(
    tickers=apple,
    fiscal_year=2025,
    fiscal_quarter="2",
    timeframe="quarterly",
    raw=True
)

# prints JSON resonse
json_apple = json.loads(apple_balance.data.decode('utf-8'))
print(json.dumps(json_apple, indent=2))

# can provide information on evaluation of company health
# and current investment returns
microsoft_health = client.list_financials_ratios(
    ticker=microsoft,
    raw=True
)

json_microsoft = json.loads(microsoft_health.data.decode('utf-8'))
print(json.dumps(json_microsoft, indent=2))

# grabs historical data by specifying dates (ex: past year)
try:
    dataRequest = client.list_aggs(
        ticker=tesla,
        multiplier=1,
        timespan="day",
        from_="2025-01-01",
        to="2025-10-01"
    )
    chart_data = pd.DataFrame(dataRequest)
    chart_data['data_formatted'] = pd.to_datetime(chart_data['timestamp'], unit='d')
    chart_data.plot(chart_data, x="date_formatted", y="close price", kind='line', title="Tesla Daily Close Price")

    # Plot line graph
    plt.xlabel("Date")
    plt.ylabel("Close Price")
    plt.tight_layout()
    plt.show()

# prints error if something goes wrong when generating visual
except Exception as e:
    pd.exception(f"Exception: {e}")

# can retrieve new articles based on ticker, can specify before or after particular data
apple_news = client.list_ticker_news(
    apple,
    params={"published_utc.gte": "2025-09-29"},
    order="desc",
    limit=1000
)

# massive will narrow down articles to their insights to ease the
# processing load of AI when performing overall summary
# massive provides if an article was positive/negative and their reasoning
for article in apple_news:
    print(f"{article.title} [Insights: {article.insights}]")


# can find insights into if a stock is being shorted
# this causes volatile stock prices due to a high risk period
# this type of information is also what caused the gamestop trend
def fetch_short_interest(ticker, start_date, end_date):
    data = []
    # collects historical data between start and end date
    for item in client.list_short_interest(
        ticker=ticker,
        settlement_date_gte=start_date,
        settlement_date_lte=end_date,
        sort="settlement_date.asc",
        limit=1000,
    ):
        # includes in data list the date, short_interest, and ticker
        data.append({
            "date": item.settlement_date,
            "short_interest": item.short_interest,
            "ticker": item.ticker
        })
    df = pd.DataFrame(data)
    df["date"] = pd.to_datetime(df["date"])
    return df


# returns information on short interest for gamestop
gamestop_short_interest = fetch_short_interest("GME", "2020-06-01", "2021-06-31")


# plots the information into a graph to be easily understood by user
def plot_short_interest(data, ticker):
    # controls graph design
    plt.figure(figsize=(10, 5))
    plt.plot(data['date'], data['short_interest'], marker='o', linestyle='-', color='red')
    plt.title(f"Short Interest in {ticker} (June 2020 - June 2021)", fontsize=14, fontweight='bold')
    plt.xlabel('Date')
    plt.ylabel('Short Interest')
    plt.grid(True)

    # controls graph axes
    plt.gca().xaxis.set_major_locator(mdates.MonthLocator())
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
    plt.xticks(rotation=45)
    plt.gca().yaxis.set_major_formatter(ticker.StrMethodFormatter('{x:,.0f}'))

    # plots graph
    plt.tight_layout()
    plt.show()


plot_short_interest(gamestop_short_interest, "GME")
