angular.module('fm')
  .factory('StockService', ['$http', 'AppConfig', function($http, AppConfig) {
    var PREFIX = AppConfig.API_PREFIX;
    var STOCK_FIELDS = [{
      no: 1,
      name: "Stock Name",
      field: 'displayName'
    }, {
      no: 2,
      name: "Current Stock Price",
      field: 'currentStockPrice'
    }, {
      no: 3,
      name: "Sector",
      field: 'sector',
      splitBy: ' '
    },{
      no: 4,
      name: "Industry",
      field: 'industry',
      splitBy: '—'
    }, {
      no: 5,
      name: "Price Change",
      field: 'priceChangePercentage',
      colorMinus: true,
      format: 'colorZero',
      unit: '%'
    }, {
      no: 6,
      name: "10 Day Moving Average",
      field: 'averageTenDays',
      rowColor: 'bg-success text-white'
    }, {
      no: 7,
      name: "Market Cap",
      field: 'marketCap',
      unit: 'market'
    }, {
      no: 8,
      name: "52 Week Low",
      field: 'fiftyTwoWeekLow'
    }, {
      no: 9,
      name: "52 Week High",
      field: 'fiftyTwoWeekHigh'
    }, {
      no: 10,
      name: "% Fall: 52 Week High to Low",
      field: 'percentFall',
      unit: '%'
    }, {
      no: 11,
      name: "Discount from 52 Week High",
      field: 'discountFrom52WeekHigh',
      unit: '%'
    }, {
      name: "Earnings, Income & Growth",
      heading: true,
      rowColor: 'bg-warning'
    }, {
      no: 12,
      name: "Earnings Yield (LTM) (per share)",
      field: 'earningsYield',
      unit: '%'
    }, {
      no: 13,
      name: "EPS (TTM) ↑",
      field: 'trailingEPS',
      rowColor: 'bg-success text-white'
    }, {
      no: 14,
      name: "EPS Forecast ↑",
      field: 'epsForecast'
    }, {
      no: 15,
      name: "Revenue Growth Forecast 1YR",
      field: 'revenueForecast',
      unit: '%'
    }, {
      no: 16,
      name: "P/E Ratio (LTM) (<20 ideal) ↓",
      field: 'trailingPE',
      rowColor: 'bg-success text-white'
    }, {
      no: 17,
      name: "Gross Profit Growth (LTM) ↑",
      field: 'grossProfitGrowth',
      unit: '%'
    }, {
      no: 18,
      name: "Net Profit Growth (LTM) ↑",
      field: 'netProfitGrowth',
      unit: '%'
    }, {
      no: 19,
      name: "Net Income Margin (LTM) ↑",
      field: 'netIncomeMargin',
      unit: '%',
      rowColor: 'bg-primary text-white'
    }, {
      no: 20,
      name: "BM Score > -2.22 More Neg is better"
    }, {
      no: 21,
      name: "Net Income Forecast CAGR (5y)",
      field: 'netIncomeForecast',
      unit: '%'
    }, {
      no: 22,
      name: "Return on Equity CAGR (3y)↑ 14%",
      field: 'roe',
      unit: '%',
      rowColor: 'bg-success text-white'
    }, {
      no: 23,
      name: "Free Cash Flow Yield (LTM) ↑ >5",
      field: 'freeCashFlowYield',
      unit: '%',
      rowColor: 'bg-success text-white'
    }, {
      no: 24,
      name: "Total Shareholder Yield (LTM) ↑",
      field: 'totalShareHolder',
      unit: '%',
      rowColor: 'bg-primary text-white'
    }, {
      name: "DIVIDENDS Dividends are a bonus to investing in a good company",
      heading: true,
      rowColor: 'bg-warning'
    }, {
      no: 25,
      name: "Dividends Per Share",
      field: 'dividendsPerShare'
    }, {
      no: 26,
      name: "Dividend Mean Forecast",
      field: 'dividendMeanForecast'
    }, {
      no: 27,
      name: "Dividend Yield (LTM) ↑ 4%",
      field: 'dividendYield',
      unit: '%'
    }, {
      no: 28,
      name: "Dividend Payout Ratio (LTM)",
      field: 'dividendPayoutRatio',
      unit: '%'
    }, {
      no: 29,
      name: "Dividend Growth Rate (LTM) ↑",
      field: 'dividendGrowthRate',
      unit: '%'
    }, {
      no: 30,
      name: "Dividend Frequency",
      field: 'dividendFrequency'
    }, {
      name: "FINANCIALS. Does the company run on good margins?",
      heading: true,
      rowColor: 'bg-warning'
    }, {
      no: 31,
      name: "Total Revenue (LTM)",
      field: 'totalRevenue',
      unit: 'market'
    }, {
      no: 32,
      name: "Cost of Goods (LTM)",
      field: 'costOfGoods',
      unit: 'market'
    }, {
      no: 33,
      name: "Operating Income / Loss (LTM)",
      field: 'operatingIncome',
      unit: 'market'
    }, {
      no: 34,
      name: "Gross Profit (LTM)",
      field: 'grossProfit',
      unit: 'market'
    }, {
      no: 35,
      name: "Cost of Goods Margin (LTM) ↓",
      field: 'costOfGoodsMargin',
      unit: '%'
    }, {
      no: 36,
      name: "Gross Margin (LTM) ↑",
      field: 'grossMargin',
      unit: '%'
    }, {
      no: 37,
      name: "Operating Margin (LTM) ↑",
      field: 'operatingMargin',
      unit: '%'
    }, {
      no: 38,
      name: "Altman Z-score",
      field: 'zscore'
    }, {
      name: "BALANCE SHEET. Is the comapany financially stable?",
      heading: true,
      rowColor: 'bg-warning'
    }, {
      no: 39,
      name: "Total Cash & Short T Investments (Q)",
      field: 'totalCash',
      unit: 'market'
    }, {
      no: 40,
      name: "Total Current Assets (Q)",
      field: 'totalCurrentAssets',
      unit: 'market'
    }, {
      no: 41,
      name: "- Total Current Liabilities (Q)",
      field: 'totalCurrentLiabilities',
      unit: 'market'
    }, {
      no: 42,
      name: "= Total 1 Year Current Excess ↑",
      field: 'total1YearExcess',
      unit: 'market'
    }, {
      no: 43,
      name: "C Assets V. C Liabilities ↑ >1",
      field: 'currentAssetsPerLiabilities'
    }, {
      no: 44,
      name: "Total Assets (Q)",
      field: 'totalAssets',
      unit: 'market'
    }, {
      no: 45,
      name: "Total Liabilities (Q)",
      field: 'totalLiabilities',
      unit: 'market'
    }, {
      no: 46,
      name: "T Assets V. T Liabilities ↑ TATL Ratio",
      field: 'totalAssetsPerLiabilities',
      rowColor: 'bg-success text-white'
    }, {
      no: 47,
      name: "Total Stockholders Equity (Q) ↑",
      field: 'totalStockholderEquity',
      unit: 'market'
    }, {
      no: 48,
      name: "D/E Debt Equity Ratio ↓",
      field: 'debtEquityRatio'
    }, {
      name: "↑↑ The Info Above Gives The Financial Analysis Of The Stock Companies. Which Companies Are The Strongest? ↑↑",
      heading: true,
      rowColor: 'bg-yellow'
    }, {
      name: ' ',
      heading: true,
      rowColor: 'bg-white'
    },{
      name: "↓↓ The Info Below Are Valuations, Price Targets, and Analyst Sentiment (All are subjective) ↓↓",
      heading: true,
      rowColor: 'bg-yellow'
    }, {
      name: "Price To Earnings Valuation",
      heading: true,
      rowColor: 'bg-warning'
    }, {
      no: 49,
      name: "Forward P/E (Predicted) ↑",
      field: 'forwardPE'
    }, {
      no: 50,
      name: "1 Year ADJ PE ratio",
      field: 'oneYearAdjRatio'
    }, {
      no: 51,
      name: "Current P/E (<20 is ideal)",
      field: 'currentPE'
    }, {
      no: 52,
      name: "P/E Discount From 1yr Avg ↑",
      field: 'peDiscount',
      unit: '%'
    }, {
      name: "Peter Lynch Fair Value Estimator (My formula is modified) - Just a quick check indicator. Not A Determining Factor",
      heading: true,
      rowColor: 'bg-warning'
    }, {
      no: 53,
      name: "Peter Lynch Estimator",
      field: 'peterLynchEstimator',
      colorFunc: function(val) {
        if(!val) return '';

        if (val==='Overvalued') return 'text-danger';
        if (val==='Undervalued') return 'text-success';
        return ''
      }
    }, {
      name: "Fair Value Intrinsic Estimator",
      heading: true,
      rowColor: 'bg-warning'
    }, {
      no: 54,
      name: "Estimated Intrinsic Value",
      field: ''
    }, {
      no: 55,
      name: "Fair Value Int. Upside Estimate ↑",
      field: ''
    }, {
      no: 56,
      name: "Fair Value Int. Uncertainty ↓",
      field: ''
    }]
    var INTRINSIC_FIELDS = [{
      name: "Company Name",
      field: 'displayName'
    }, {
      name: "EXchange",
      field: 'exchange'
    },{
      name: "Current Price",
      field: 'currentStockPrice'
    }, {
      name: "Dividend",
      field: 'dividendsPerShare'
    },{
      name: "Dividend Yield",
      field: "dividendYield",
      unit: '%'
    }, {
      name: "Dividend Frequency",
      field: "dividendFrequency"
    }, {
      name: "Payment Date",
      field: "dividendDate",
      dateFormat: 'mmm dd, yyyy'
    }, {
      name: "Ex-Dividend Date",
      field: "exDividendDate",
      dateFormat: 'mmm dd, yyyy'
    }, {
      name: "EPS",
      field: 'trailingEPS'
    }, {
      name: "Next 5 years (per annum)",
      field: 'netIncomeForecast',
      unit: '%'
    }, {
      name: "AAA Bond Yield",
      field: 'bondYield',
      unit: '%'
    }, {
      name: "P/E",
      field: 'fixedPE',
      format: 'fixed'
    }, {
      name: "1g",
      field: 'fixed1G',
      format: 'fixed'
    },{
      name: "Corp Bond",
      field: 'fixedCorpBond',
      format: 'fixed'
    }, {
      name: "Intrinsic Value",
      field: 'intrinsic'
    }, {
      name: "BUY/SALE",
      field: 'buy_or_sale',
      format: 'buySale'
    }, {
      name: "Upside",
      field: 'upside',
      unit: '%'
    }]
    var DIVIDEND_FIELDS = [{
      name: "Company Name",
      field: 'displayName'
    },{
      name: "Exchange",
      field: 'exchange'
    },{
      name: "Share Price",
      field: 'currentStockPrice'
    }, {
      name: "Dividend Frequency",
      field: "dividendFrequency"
    },{
      name: "Dividend Per Share",
      field: 'dividendsPerShare'
    },{
      name: "Dividend Yield",
      field: "dividendYield",
      unit: '%'
    }, {
      name: "Ex-Dividend Date",
      field: "exDividendDate",
      dateFormat: 'mmm dd, yyyy'
    }, {
      name: "Payment Date",
      field: "dividendDate",
      dateFormat: 'mmm dd, yyyy'
    }, {
      name: "Forward Annual Dividend Rate",
      field: "forwardDividend"
    }];
    var DIVIDEND_SUMMARY_FIELDS = [{
      name: "Stock Name",
      field: 'displayName'
    },{
      name: "Symbol",
      field: "code"
    },{
      name: "Exchange",
      field: 'exchange'
    },{
      name: "Share Price",
      field: 'priceChangeDisplay',
      format: function(input, value) {
        return 'bg-yellow'
      }
    }, {
      name: "Dividend Frequency",
      field: "dividendFrequency"
    },{
      name: "Dividend Per Share",
      field: 'dividendsPerShare',
      round: 2,
      format: function(input, value) {
        return 'bg-success text-white'
      }
    },{
      name: "Dividend Yield",
      field: "dividendYield",
      unit: '%'
    }, {
      name: "Payout Ratio",
      field: "payoutRatio",
      unit: '%'
    },{
      name: "Ex-Dividend Date",
      field: "exDividendDate",
      dateFormat: 'mmm dd, yyyy'
    }, {
      name: "Payment Date",
      field: "dividendDate",
      dateFormat: 'mmm dd, yyyy'
    }, 
    // {
    //   name: "Dividend Growth Rate",
    //   field: "forwardDividend"
    // }, 
    {
      name: "Share Bought",
      field: "init_share",
      round: 0
    }, {
      name: 'Cost Average',
      field: 'init_price',
      round: 4
    }, {
      name: 'Profit/Loss',
      field: 'profit_or_lost',
      format: function(input, value) {
        return value > 0 ? 'bg-yellow text-success' : 'bg-yellow text-danger'
      }
    }, {
      name: 'Profit/Loss (%)',
      field: 'profit_or_lost_percent',
      unit: '%',
      format: function(input, value) {
        return value > 0 ? 'bg-yellow text-success' : 'bg-yellow text-danger'
      }
    }];
    /** Stock API */
    function getStocks() {
      console.log('[StockService] getStocks()');
      var config = {page: 1, page_size:100};
      
      return $http.get(PREFIX + `stock/stocks/`, {params: config})
        .then(function(res) {
          return res.data;
        });
    }

    function addStock(data) {
      return $http.post(`${PREFIX}stock/stocks/`, data);
    }

    function updateStock(id, data) {
      return $http.patch(`${PREFIX}stock/stocks/${id}/`, {code:data.code});
    }

    function deleteStock(id) {
      return $http.delete(PREFIX + `stock/stocks/${id}/`)
    }

    /**Intrinsic Stock API */
    function getIntrinsicStocks() {
      console.log('[StockService] getIntrinsicStocks()');
      var config = {page: 1, page_size:100};
      
      return $http.get(PREFIX + `stock/intrinsic_stocks/`, {params: config})
        .then(function(res) {
          return res.data;
        });
    }

    function addIntrinsicStock(data) {
      return $http.post(`${PREFIX}stock/intrinsic_stocks/`, data);
    }

    function updateIntrinsicStock(id, data) {
      return $http.patch(`${PREFIX}stock/intrinsic_stocks/${id}/`, {code:data.code});
    }

    function deleteIntrinsicStock(id) {
      return $http.delete(PREFIX + `stock/intrinsic_stocks/${id}/`)
    }

    function getBondYield() {
      return $http.get(`${PREFIX}stock/bondyields/`)
        .then(function(res) {
          return res.data;
        });
    }
    /** Dividend */
    function getDividendStocks(params) {
      return $http.get(`${PREFIX}stock/dividend_stocks/`, {params})
        .then(function(res) {
          return res.data;
        });
    }
    function addDividendStock(data) {
      return $http.post(`${PREFIX}stock/dividend_stocks/`, data);
    }
    function buyDividendStock(data) {
      return $http.post(`${PREFIX}stock/dividend_stocks/buy/`, data);
    }
    function sellDividendStock(id, data) {
      return $http.post(`${PREFIX}stock/dividend_stocks/${id}/sell/`, data);
    }
    function updateDividendStock(id, data) {
      return $http.put(`${PREFIX}stock/dividend_stocks/${id}/`, data);
    }
    function deleteDividendStock(id) {
      return $http.delete(`${PREFIX}stock/dividend_stocks/${id}/`);
    }
    function stockInfo(symbol) {
      return $http.get(`${PREFIX}stock/info/`, {params: {symbol}});
    }
    function stockChart(symbol) {
      return $http.get(`${PREFIX}stock/chart/`, {params: {symbol}});
    }
    function stockProfile(symbol) {
      return $http.get(`${PREFIX}stock/profile/`, {params: {symbol}});
    }
    function stockFinances(symbol) {
      return $http.get(`${PREFIX}stock/finances/`, {params: {symbol}});
    }
    function findStocks(q) {
      return $http.get(`${PREFIX}stock/find_stocks/`, {params: {q}});
    }
    function getStockNote() {
      return $http.get(`${PREFIX}stock/stock_note/`);
    }
    function updateStockNote(data) {
      return $http.post(`${PREFIX}stock/stock_note/`, data);
    }

    return {
      /** stock data */
      getStocks,
      addStock,
      updateStock,
      deleteStock,
      /** Intrinsic value stocks */
      getIntrinsicStocks,
      addIntrinsicStock,
      updateIntrinsicStock,
      deleteIntrinsicStock,
      /** Bond Yield */
      getBondYield,
      /**Dividend */
      addDividendStock,
      getDividendStocks,
      updateDividendStock,
      deleteDividendStock,
      buyDividendStock,
      sellDividendStock,
      /** Stock Info */
      stockInfo,
      stockChart,
      stockProfile,
      stockFinances,
      findStocks,

      getStockNote,
      updateStockNote,
      
      /** Const */
      STOCK_FIELDS,
      INTRINSIC_FIELDS,
      DIVIDEND_FIELDS,
      DIVIDEND_SUMMARY_FIELDS
    }

  }]);