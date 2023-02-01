angular.module('fm')
  .factory('YahooService', ['$http', 'AppConfig', function($http, AppConfig) {
    var PREFIX = AppConfig.API_PREFIX;
    
    var quoteCache = {};
    var quoteSummaryCache = {};
    var chartCache = {};
    var historyCache = {};
    /** Yahoo Stock API */
    function getQuote(symbols) {
      console.log('[YahooService] getQuote()');
      if(!_.isArray(symbols)) {
        return Promise.reject();
      }

      symbols = _.uniq(symbols)
      let check = true;
      _.each(symbols, (s)=>{
        if (!getQuoteFromCache(s)){
          check = false;
          return false;
        }
      })
      if(check) {
        return Promise.resolve()
      }
        
      symbols = symbols.join(',')
      
      return $http.get(`${PREFIX}stock/yahoo_quote/`, {params: {
        symbols
      }})
        .then(function({data}) {
          updateQuoteCache(data);
          return data;
        });
    }

    function getQuoteSummary(symbol) {
      console.log('[YahooService] getSummaryQuote()');
      let cache = getQuoteSummaryFromCache(symbol)
      if(cache) {
        return Promise.resolve(cache);
      }
      return $http.get(`${PREFIX}stock/yahoo_quote_summary/`, { params: {
        symbol: symbol
      }})
        .then(function({data}) {
          updateQuoteSummaryCache(symbol, data)
          return data;
        });
    }

    function getChart(symbol) {
      console.log('[YahooService] getChart()');
      let cache = getChartFromCache(symbol);
      if (cache) {
        return Promise.resolve(cache);
      }
      chartCache[symbol] = [];
      return getDividendData(symbol, 1)
        .then(function({data}) {
          chartCache[symbol][0] = data;
          return getDividendData(symbol, 2)
            .then(({data})=>{
              chartCache[symbol][1] = data;
            })
          })
    }

    function getHistory(symbol, numberOfDays) {
      console.log('[YahooService] getHistory()');
      if(!numberOfDays) numberOfDays = 10;
      let cache = getHistoryFromCache(symbol);
      if (cache) {
        return Promise.resolve(cache);
      }
      historyCache[symbol] = null;
      var today = new Date();
      var day = today.getUTCDate()+1;
      var month = today.getUTCMonth();
      var year = today.getUTCFullYear();

      var p2 = Date.UTC(year, month, day)/1000;
      var p1 = p2-numberOfDays*86400;

      return $http.get(`${PREFIX}stock/yahoo_history/`, { params: {
        symbol,
        p1,
        p2
      }})
      .then(({data})=>{
        historyCache[symbol] = data;
        return data;
      })
      
    }

    function updateQuoteCache(data) {
      _.each(data.quoteResponse.result, (d)=> {
        quoteCache[d.symbol] = d;
      })
    }
    function updateQuoteSummaryCache(symbol, data) {
      quoteSummaryCache[symbol] = data.quoteSummary.result[0]
    }
    function getQuoteFromCache(symbol) {
      return quoteCache[symbol] || null;
    }
    function getQuoteSummaryFromCache(symbol) {
      return quoteSummaryCache[symbol] || null;
    }
    function getChartFromCache(symbol) {
      return chartCache[symbol] || null;
    }
    function getHistoryFromCache(symbol) {
      return historyCache[symbol] || null;
    }

    function parseStock(symbol) {
      let quoteData = getQuoteFromCache(symbol)
      let quoteSummaryData = getQuoteSummaryFromCache(symbol)
      let chartData = getChartFromCache(symbol)
      let historyData = getHistoryFromCache(symbol)

      let stockData = {
        symbol: symbol,
        displayName: quoteData.displayName || quoteData.shortName,
        longName: quoteData.longName,
        currentStockPrice: quoteData.regularMarketPrice,
        currency: quoteData.currency,
        marketCap: quoteData.marketCap,
        trailingPE: quoteData.trailingPE,
        forwardPE: quoteData.forwardPE,
        currentPE: quoteData.trailingPE,
        exchange: quoteData.fullExchangeName,
        dividendDate: quoteData.dividendDate?new Date(quoteData.dividendDate*1000):'N/A',
        //summary 
        industry: quoteSummaryData.assetProfile.industry.split('—')[0],
        priceChange: _.round(quoteSummaryData.price.regularMarketChange.raw,2),
        priceChangePercentage: 100*quoteSummaryData.price.regularMarketChangePercent.raw,
        lastPrice: quoteSummaryData.price.regularMarketPreviousClose.raw,
        dailyHigh: quoteSummaryData.price.regularMarketDayHigh.raw,
        dailyLow: quoteSummaryData.price.regularMarketDayLow.raw,
        dailyVolume: quoteSummaryData.price.regularMarketVolume.raw,

        priceChangeDisplay: 'N/A',
        marketTime: quoteData.regularMarketTime.raw,
        sector: quoteSummaryData.assetProfile.sector,
        fiftyTwoWeekLow: quoteSummaryData.summaryDetail.fiftyTwoWeekLow.raw,
        fiftyTwoWeekHigh: quoteSummaryData.summaryDetail.fiftyTwoWeekHigh.raw,
        fiftyDayAverage: quoteSummaryData.summaryDetail.fiftyDayAverage.raw,
        twoHundredDayAverage: quoteSummaryData.summaryDetail.twoHundredDayAverage.raw,
        trailingEPS: quoteSummaryData.defaultKeyStatistics.trailingEps.raw,
        epsForecast: quoteSummaryData.defaultKeyStatistics.forwardEps.raw,
        exDividendDate: getDividendDate(quoteSummaryData),
        
        grossProfitGrowth: 100*(quoteSummaryData.incomeStatementHistory.incomeStatementHistory[0].grossProfit.raw-quoteSummaryData.incomeStatementHistory.incomeStatementHistory[1].grossProfit.raw)/quoteSummaryData.incomeStatementHistory.incomeStatementHistory[1].grossProfit.raw,
        netProfitGrowth: 100*(quoteSummaryData.incomeStatementHistory.incomeStatementHistory[0].netIncome.raw-quoteSummaryData.incomeStatementHistory.incomeStatementHistory[1].netIncome.raw)/quoteSummaryData.incomeStatementHistory.incomeStatementHistory[1].netIncome.raw,
        netIncomeMargin: 100*_.sumBy(quoteSummaryData.incomeStatementHistoryQuarterly.incomeStatementHistory, (i)=>{return i.netIncome.raw;}) / _.sumBy(quoteSummaryData.incomeStatementHistoryQuarterly.incomeStatementHistory, (i)=>{return i.totalRevenue.raw;}),
        dividendsPerShare: quoteSummaryData.summaryDetail.dividendRate.raw||0,
        dividendYield: 100 * (quoteSummaryData.summaryDetail.dividendYield.raw||0),
        totalRevenue: _.sumBy(quoteSummaryData.incomeStatementHistoryQuarterly.incomeStatementHistory, (i => i.totalRevenue.raw)),
        costOfGoods: _.sumBy(quoteSummaryData.incomeStatementHistoryQuarterly.incomeStatementHistory, (i => i.costOfRevenue.raw)),
        operatingIncome: _.sumBy(quoteSummaryData.incomeStatementHistoryQuarterly.incomeStatementHistory, (i=>i.operatingIncome.raw)),
        grossProfit: _.sumBy(quoteSummaryData.incomeStatementHistoryQuarterly.incomeStatementHistory, (i=>i.grossProfit.raw)),
        
        totalCash: getTotalCash(quoteSummaryData), // later quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements[0].cash.raw + (quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements[0].shortTermInvestments? quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements[0].shortTermInvestments.raw:0),
        totalCurrentAssets: getTotalCurrentAssets(quoteSummaryData),
        totalCurrentLiabilities: getTotalCurrentLiabilities(quoteSummaryData),

        totalAssets: getTotalAssets(quoteSummaryData),
        totalLiabilities: getTotalLiabilities(quoteSummaryData),
        totalStockholderEquity: getTotalStockholderEquity(quoteSummaryData),
        
        // need to calculate 
        averageTenDays: 'N/A', // =MovingAverage()
        percentFall: 'N/A', //Later
        discountFrom52WeekHigh: 'N/A', //Later
        earningsYield: 'N/A', //later
        revenueForecast: 'N/A', // =EstRevGrowth1YR(C3)
        netIncomeForecast: 'N/A', // =EstRevGrowth5YR(C3)
        roe: 'N/A', //Later
        freeCashFlowYield: 'N/A', //Later
        totalShareHolder: 'N/A', //Later
        dividendGrowthRate: 'N/A', //=DividendGrowthRateTTM(C3)
        dividendMeanForecast: 'N/A', // Later
        dividendPayoutRatio: 'N/A', //Later
        dividendFrequency: 'N/A', // =DividendFrequency(C3)
        grossMargin: 'N/A', // Later
        operatingMargin: 'N/A', // Later 
        zscore: 'N/A', //Later
        total1YearExcess: 'N/A', //Later
        currentAssetsPerLiabilities: 'N/A', //Later
        totalAssetsPerLiabilities: 'N/A', //Later
        debtEquityRatio: 'N/A', //Later
        oneYearAdjRatio: 'N/A', // Later
        peDiscount: 'N/A', //Later
        peterLynchEstimator: 'N/A', //Later 
        costOfGoodsMargin: 'N/A', //Later

        //require more
        payoutRatio: 100*quoteSummaryData.summaryDetail.payoutRatio.raw,
        beta: quoteSummaryData.summaryDetail.beta.raw
      }
     
      stockData.percentFall = stockData.fiftyTwoWeekLow?(100*(stockData.fiftyTwoWeekHigh - stockData.fiftyTwoWeekLow)/stockData.fiftyTwoWeekLow): 'N/A';
      stockData.discountFrom52WeekHigh = stockData.fiftyTwoWeekHigh?(100*(stockData.fiftyTwoWeekHigh-stockData.currentStockPrice)/stockData.fiftyTwoWeekHigh): 'N/A';
      stockData.earningsYield = 100 * (1/stockData.trailingPE);
      stockData.roe = 100*(Math.pow((quoteSummaryData.incomeStatementHistory.incomeStatementHistory[0].netIncome.raw / quoteSummaryData.balanceSheetHistory.balanceSheetStatements[0].totalStockholderEquity.raw) / 
                      (quoteSummaryData.incomeStatementHistory.incomeStatementHistory[3].netIncome.raw / quoteSummaryData.balanceSheetHistory.balanceSheetStatements[3].totalStockholderEquity.raw), 1/3)-1);
      stockData.freeCashFlowYield = getFreeCashFlowYield(quoteSummaryData, stockData)//(_.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i => i.totalCashFromOperatingActivities.raw)) +
                                    //_.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i => i.capitalExpenditures.raw ))) / quoteSummaryData.defaultKeyStatistics.sharesOutstanding.raw;
      stockData.totalShareHolder = getTotalShareHolder(quoteSummaryData, stockData);
                                  //  100*(-1 * (stockData.dividendsPerShare>0 ? _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i => i.dividendsPaid.raw)):0) +
                                  //   -1 * _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i => i.repurchaseOfStock?i.repurchaseOfStock.raw:0)) - 
                                  //        _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i => i.issuanceOfStock?i.issuanceOfStock.raw:0))) / stockData.marketCap;
      stockData.dividendMeanForecast = stockData.dividendsPerShare * (1+stockData.dividendGrowthRate);
      
      stockData.dividendPayoutRatio = stockData.dividendsPerShare<=0 ? 0 : 
        -100 * _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i)=> { return i.dividendsPaid?i.dividendsPaid.raw:0 }) / 
            (_.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i) => { return i.totalCashFromOperatingActivities?i.totalCashFromOperatingActivities.raw:0 }) +
            _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i) => { return i.capitalExpenditures?i.capitalExpenditures.raw:0 }));

      stockData.grossMargin = _.round(100*(stockData.totalRevenue - stockData.costOfGoods)/stockData.totalRevenue, 2);
      stockData.operatingMargin = _.round(100* stockData.operatingIncome / stockData.totalRevenue, 2);
      stockData.total1YearExcess = stockData.totalCurrentAssets - stockData.totalCurrentLiabilities;
      stockData.currentAssetsPerLiabilities = _.round(stockData.totalCurrentAssets / stockData.totalCurrentLiabilities,2);
      stockData.totalAssetsPerLiabilities = _.round(stockData.totalAssets / stockData.totalLiabilities,2);
      stockData.debtEquityRatio = stockData.totalLiabilities / stockData.totalStockholderEquity;
      stockData.oneYearAdjRatio = quoteSummaryData.earningsHistory?stockData.currentStockPrice / _.sumBy(quoteSummaryData.earningsHistory.history, (i)=> { return i.epsActual.raw }):'N/A';
      stockData.peDiscount = -100*((stockData.currentPE - stockData.oneYearAdjRatio)/stockData.oneYearAdjRatio);
      stockData.costOfGoodsMargin = _.round(100*stockData.costOfGoods / stockData.totalRevenue, 2);
      stockData.peterLynchEstimator = getPeterLynchEstimator(quoteSummaryData, stockData);
      stockData.zscore = getZScore(quoteSummaryData, stockData);
      
      stockData.dividendFrequency = calcDividendFrequency(chartData);
      stockData.dividendGrowthRate = calcDividendGrowthRate(chartData);
      stockData.dividendMeanForecast = stockData.dividendsPerShare*(1 + (stockData.dividendGrowthRate/100));
      stockData.revenueForecast = calcRevGrowth1YR(quoteSummaryData);
      stockData.averageTenDays = calcAverageTenDays(historyData);
      stockData.netIncomeForecast = calcRevGrowth5YR(quoteSummaryData);
      stockData.priceChangeDisplay = getPriceChangeDisplay(stockData);
      return stockData;
    }

    function getPriceChangeDisplay(_stockData) {
      var _cl = '';
      var _arrow = '|';
      if(_stockData.priceChange<0) {
        _cl = 'text-danger';
        _arrow = '▼';
      }else if(_stockData.priceChange>0) {
        _cl = 'text-success';
        _arrow = '▲';
      }
      let res = `<span class="${_cl}">${_stockData.currentStockPrice} ${_arrow} ${_stockData.priceChange} (${_.round(_stockData.priceChangePercentage,2)}%)</span>`
      if(_stockData.marketTime) {
        let tz = moment.tz.guess()
        let m = moment(_stockData.marketTime*1000).tz(tz)
        res = `${res}<small class="d-block">Closed at ${m.format("MMM DD H:mm a z")}</small>`
      }
      return res;
    }

    function getTotalCash(_quoteSummaryData) {
      if(!_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements) return 'N/A';
      let res = 'N/A';
      _.each(_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements, (i)=> {
        if(i.cash) {
          res = i.cash.raw;
          res += (i.shortTermInvestments? i.shortTermInvestments.raw : 0)
          return false;
        }
      })
      return res;
    }

    function getDividendDate(_quoteSummaryData) {
      if (!_quoteSummaryData.summaryDetail.exDividendDate) return 'N/A';
      if (!_quoteSummaryData.summaryDetail.exDividendDate.raw) return 'N/A';
      return new Date(_quoteSummaryData.summaryDetail.exDividendDate.raw*1000);
    }

    function getTotalCurrentAssets(_quoteSummaryData) {
      if(!_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements) return 'N/A';
      let res = 'N/A';
      _.each(_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements, (i)=>{
        if (i.totalCurrentAssets) {
          res = i.totalCurrentAssets.raw;
          return false;
        }
      })
      return res;
    }

    function getTotalCurrentLiabilities(_quoteSummaryData) {
      if(!_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements) return 'N/A';
      let res = 'N/A';
      _.each(_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements, (i)=>{
        if (i.totalCurrentLiabilities) {
          res = i.totalCurrentLiabilities.raw;
          return false;
        }
      })
      return res;
    }

    function getTotalAssets(_quoteSummaryData) {
      if(!_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements) return 'N/A';
      let res = 'N/A';
      _.each(_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements, (i)=>{
        if (i.totalAssets) {
          res = i.totalAssets.raw;
          return false;
        }
      })
      return res;
    }
    function getTotalLiabilities(_quoteSummaryData) {
      if(!_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements) return 'N/A';
      let res = 'N/A';
      _.each(_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements, (i)=>{
        if (i.totalLiab) {
          res = i.totalLiab.raw;
          return false;
        }
      })
      return res;
    }
    function getTotalStockholderEquity(_quoteSummaryData) {
      if(!_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements) return 'N/A';
      let res = 'N/A';
      _.each(_quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements, (i)=>{
        if (i.totalStockholderEquity) {
          res = i.totalStockholderEquity.raw;
          return false;
        }
      })
      return res;
    }

    function getPeterLynchEstimator(_quoteSummaryData, stockData) {
      let eps = stockData.trailingEPS
      let currentStockPrice = stockData.currentStockPrice
      let egr = getEarningsGrowthRate(_quoteSummaryData);

      let _earningsGrowthRate = (egr * 100 * eps)/currentStockPrice;
      if (_earningsGrowthRate<0.9) {
        return 'Overvalued';
      }else if (_earningsGrowthRate<=1.1) {
        return 'Near Value';
      }else {
        return 'Undervalued';
      }
    }
    function getEarningsGrowthRate(_quoteSummaryData) {
      if (!_quoteSummaryData.earnings) {
        return "N/A";
      }
      let data = _quoteSummaryData.earnings.financialsChart.yearly;
      if(data.length<=1) {
        return 'N/A';
      }
      
      var begin = parseFloat(data[0].earnings.raw);
      var end = parseFloat(data[data.length-1].earnings.raw);
      var res = (Math.abs(end/begin)**(1/(data.length-1))-1);
      return res;
      
    }
    
    function getDividendData(symbol, yearBefore) {
      var today = new Date();
      var day = today.getUTCDate()+1;
      var month = today.getUTCMonth();
      var year = today.getUTCFullYear();

      var p1 = Date.UTC(year-yearBefore, month, day)/1000;
      var p2 = Date.UTC(year-(yearBefore-1), month, day)/1000;
      return $http.get(`${PREFIX}stock/yahoo_chart/`, { params: {
        symbol,
        p1,
        p2
      }})
    }

    function getFreeCashFlowYield(quoteSummaryData, stockData) {
      let res = _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, i => {
        if (i.totalCashFromOperatingActivities) return i.totalCashFromOperatingActivities.raw;
        return 0;
      })
      res = res + _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, i => {
        if(i.capitalExpenditures) return i.capitalExpenditures.raw 
        return 0;
      })
      if (quoteSummaryData.defaultKeyStatistics.sharesOutstanding) {
        res = res/quoteSummaryData.defaultKeyStatistics.sharesOutstanding.raw;
      }else {
        return 'N/A';
      }
      return _.round(100 * res / stockData.currentStockPrice, 2)
      
    }
    function getZScore(quoteSummaryData, stockData) {
      // 1.2*(stockData.total1YearExcess/stockData.totalAssets) +
      // 1.4*(quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements[0].retainedEarnings.raw/stockData.totalAssets) + 
      // 3.3*(_.sumBy(quoteSummaryData.incomeStatementHistoryQuarterly.incomeStatementHistory, (i)=>i.ebit.raw/stockData.totalAssets)) +
      // 0.6*(stockData.marketCap/stockData.totalLiabilities) +
      // 1*(stockData.totalRevenue/stockData.totalAssets);
      let res = 1.2*(stockData.total1YearExcess/stockData.totalAssets);
      if(quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements) {
        let retainedEarnings = 0;
        _.each(quoteSummaryData.balanceSheetHistoryQuarterly.balanceSheetStatements, (item)=>{
          if(item.retainedEarnings) {
            retainedEarnings = item.retainedEarnings.raw;
            return false;
          }
        })
        res = res + (1.4*(retainedEarnings/stockData.totalAssets))
      }
      res = res + (3.3*(_.sumBy(quoteSummaryData.incomeStatementHistoryQuarterly.incomeStatementHistory, i=>{ 
        if(i.ebit) return i.ebit.raw;
        return 0
      })/stockData.totalAssets))
      res = res + 0.6*(stockData.marketCap/stockData.totalLiabilities);
      res = res + 1*(stockData.totalRevenue/stockData.totalAssets);
      return res;
    }

    function getTotalShareHolder(quoteSummaryData, stockData) {
      //  100*(-1 * (stockData.dividendsPerShare>0 ? _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i => i.dividendsPaid.raw)):0) +
      //   -1 * _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i => i.repurchaseOfStock?i.repurchaseOfStock.raw:0)) - 
      //        _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, (i => i.issuanceOfStock?i.issuanceOfStock.raw:0))) / stockData.marketCap;
      let res = 0;
      let t = 0;
      if (stockData.dividendsPerShare>0) {
        t =  _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, i => {
          if (i.dividendsPaid) return i.dividendsPaid.raw;
          return 0;
        })
        res = res - t;
      }
      t = _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, i => {
        if (i.repurchaseOfStock) return i.repurchaseOfStock.raw;
        return 0; 
      })
      res = res - t;
      t = _.sumBy(quoteSummaryData.cashflowStatementHistoryQuarterly.cashflowStatements, i => { 
        if (i.issuanceOfStock) return i.issuanceOfStock.raw;
        return 0
      })
      res = res - t;
      res = 100*res/stockData.marketCap;
      return res;
    }

    function calcDividendFrequency(chartData) {
      let oneYearData = chartData[0];
      let count = 0;
      try {
        count = _.size(oneYearData.chart.result[0].events.dividends);
      }catch(e) {
        console.log('No dividend paid data');
      }
      var frequencyword = '';
      switch(count) {
        case 0:
          frequencyword = "Growth";
          break;
        case 1:
          frequencyword = "Annually";
          break;
        case 2:
          frequencyword = "Semi-annually";
          break;
        case 4:
          frequencyword = "Quarterly";
          break;
        case 12:
          frequencyword = "Monthly";
          break;
        default:
          frequencyword = count.toString();
      }
      return frequencyword
    }

    function calcDividendGrowthRate(chartData) {
      let oneYearData = chartData[0]
      let twoYearData = chartData[1]
  
      let divNew = 0;
      let divOld = 0;
      let rate = 0;
      try {
        divNew = _.sumBy(_.map(oneYearData.chart.result[0].events.dividends, (i =>i.amount)));
        divOld = _.sumBy(_.map(twoYearData.chart.result[0].events.dividends, (i =>i.amount)));
      }catch(e) {
        console.log('No dividend paid data');
      }
      
      if (divOld > 0) {
        rate = 100*(divNew-divOld)/divOld;
      } else {
        rate = 0;
      }
      return rate;
    }

    function calcRevGrowth1YR(quoteSummary) {
      if(!quoteSummary.earningsTrend) return 'N/A';
      let trend = _.find(quoteSummary.earningsTrend.trend, (t) => {
        return t.period == '+1y';
      })

      if (trend) {
        return 100*trend.revenueEstimate.growth.raw;
      }
      return 'N/A'
    }

    function calcRevGrowth5YR(quoteSummary) {
      if(!quoteSummary.earningsTrend) return 'N/A';
      let trend = _.find(quoteSummary.earningsTrend.trend, (t) => {
        return t.period == '+5y';
      })

      if (trend) {
        return 100*trend.growth.raw;
      }
      return 'N/A'
    }

    function calcAverageTenDays(historyData) {
      let histories = [];
      try {
        histories = historyData.chart.result[0].indicators.adjclose[0].adjclose;
      }catch(e) {
        console.log('No AdjClose Data');
      }
      if (!histories.length) return 'N/A';
      return _.sum(histories) / histories.length;
    }

    function findStocks(q) {
      return $http.get(`${PREFIX}stock/yahoo_find_stocks/`, {params: {
        q
      }})
        .then(function({data}) {
          return data;
        });
    }

    return {
      getQuote,
      getQuoteSummary,
      parseStock,
      getChart,
      getHistory,
      findStocks
    }

  }]);

  /* assetProfile
  price 
  summaryDetail 
  defaultKeyStatistics 
  incomeStatementHistory
  incomeStatementHistoryQuarterly
  cashflowStatementHistoryQuarterly
  balanceSheetHistoryQuarterly
  earningsHistory
  */
  