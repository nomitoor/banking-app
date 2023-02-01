angular.module('fm')
  .factory('StockParser', StockParser);
  StockParser.$inject = [];
  function StockParser() {
    
    function parse(data) {
      let symbol = data.summary.symbol;
      let quoteData = data.summary.quoteData[symbol]
      let quoteSummaryData = data.summary;
      let chartData = data.chart;
      
      let stockData = {
        symbol: symbol,
        displayName: quoteData.displayName || quoteData.shortName,
        longName: quoteData.longName,
        currentStockPrice: quoteData.regularMarketPrice.raw,
        currency: quoteData.cuurency,
        marketCap: quoteData.marketCap.raw,
        trailingPE: quoteSummaryData.summaryDetail.trailingPE?quoteSummaryData.summaryDetail.trailingPE.raw:'N/A',
        forwardPE: quoteSummaryData.summaryDetail.forwardPE.raw,
        currentPE: quoteSummaryData.summaryDetail.trailingPE?quoteSummaryData.summaryDetail.trailingPE.raw:'N/A',
        exchange: quoteData.fullExchangeName,
        dividendDate: quoteSummaryData.calendarEvents.dividendDate&&quoteSummaryData.calendarEvents.dividendDate.raw?new Date(quoteSummaryData.calendarEvents.dividendDate.raw*1000):'N/A',
        //summary 
        industry: quoteSummaryData.assetProfile.industry ? quoteSummaryData.assetProfile.industry.split('—')[0] : '',
        priceChange: _.round(quoteSummaryData.price.regularMarketChange.raw, 2),
        priceChangePercentage: 100*quoteSummaryData.price.regularMarketChangePercent.raw,
        priceChangeDisplay: '',
        marketTime: quoteData.regularMarketTime.raw,
        lastPrice: quoteSummaryData.price.regularMarketPreviousClose.raw,
        dailyHigh: quoteSummaryData.price.regularMarketDayHigh.raw,
        dailyLow: quoteSummaryData.price.regularMarketDayLow.raw,
        dailyVolume: quoteSummaryData.price.regularMarketVolume.raw,
        
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
        dividendsPerShare: quoteSummaryData.summaryDetail.dividendRate.raw,
        dividendRate: 0,
        dividendYield: quoteSummaryData.summaryDetail.dividendYield && _.isNumber(quoteSummaryData.summaryDetail.dividendYield.raw)?(100 * quoteSummaryData.summaryDetail.dividendYield.raw):'N/A',
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
        // averageTenDays: 'N/A', // =MovingAverage()
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
        // require more
        payoutRatio: 100*quoteSummaryData.summaryDetail.payoutRatio.raw,
        beta: quoteSummaryData.summaryDetail.beta.raw,
        pre_price: quoteSummaryData.price.preMarketPrice?quoteSummaryData.price.preMarketPrice.raw:undefined,
        pre_price_change: quoteSummaryData.price.preMarketChange?quoteSummaryData.price.preMarketChange.raw:undefined,
        pre_percent_change: quoteSummaryData.price.preMarketChangePercent?quoteSummaryData.price.preMarketChangePercent.raw:undefined,
        pre_market_time: quoteSummaryData.price.preMarketTime?quoteSummaryData.price.preMarketTime:undefined
      }
     
      stockData.percentFall = stockData.fiftyTwoWeekLow?(100*(stockData.fiftyTwoWeekHigh - stockData.fiftyTwoWeekLow)/stockData.fiftyTwoWeekLow): 'N/A';
      stockData.discountFrom52WeekHigh = stockData.fiftyTwoWeekHigh?(100*(stockData.fiftyTwoWeekHigh-stockData.currentStockPrice)/stockData.fiftyTwoWeekHigh): 'N/A';
      stockData.earningsYield = 100 * (1/stockData.trailingPE);
      try {
        stockData.roe = 100*(Math.pow((quoteSummaryData.incomeStatementHistory.incomeStatementHistory[0].netIncome.raw / quoteSummaryData.balanceSheetHistory.balanceSheetStatements[0].totalStockholderEquity.raw) / 
                      (quoteSummaryData.incomeStatementHistory.incomeStatementHistory[3].netIncome.raw / quoteSummaryData.balanceSheetHistory.balanceSheetStatements[3].totalStockholderEquity.raw), 1/3)-1);
      }catch(e){
        console.log(e);
        stockData.roe = 'N/A'
      }
      
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
      stockData.netIncomeForecast = calcRevGrowth5YR(quoteSummaryData);
      stockData.priceChangeDisplay = getPriceChangeDisplay(stockData);
      stockData.dividendRate = calcDividendRate(stockData);
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
        let tz = Intl.DateTimeFormat().resolvedOptions().timeZone
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
    function lastYearTimestamp() {
      var today = new Date();
      var day = today.getUTCDate()+1;
      var month = today.getUTCMonth();
      var year = today.getUTCFullYear();

      return Date.UTC(year-1, month, day)/1000;
      
    }
    function calcDividendFrequency(chartData) {
      chartData = chartData.chart.result[0]
      let dividendsData = [];
      let count = 0;
      try {
        dividendsData = chartData.events.dividends;
      }catch(e) {
        console.log('No dividend paid data');
      }
      
      let _lastYear = lastYearTimestamp()
      let latestYearDividend = _.filter(dividendsData, (d)=>{
        return d.date>_lastYear
      })
      count = _.size(latestYearDividend)
      
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

    function parsePriceChangeDisplay(data, kind, includeTime) {
      if(!kind) kind = 'current';
      let price, price_change, percent_change, market_time;
      switch(kind) {
        case 'current':
          price = data.price;
          price_change = data.price_change;
          percent_change = data.percent_change;
          market_time = data.market_time;
          break;
        case 'pre':
          price = data.pre_price;
          price_change = data.pre_price_change;
          percent_change = data.pre_percent_change;
          market_time = data.pre_market_time;
          break;
        case 'post':
          break;
      }
      var _cl = '';
      var _arrow = '|';
      if (typeof price=='undefined'|| price==null) {
        return ''
      }
      if(price_change<0) {
        _cl = 'text-danger';
        _arrow = '▼';
      }else if(price_change>0) {
        _cl = 'text-success';
        _arrow = '▲';
      }else{
        _cl = 'text-warning';
      }
      let res = `<span class="${_cl}">${_.round(price,2)} ${_arrow} ${_.round(price_change,2)} (${_.round(percent_change,2)}%)</span>`
      if(market_time && includeTime) {
        let tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        let m = moment(market_time*1000).tz(tz)
        res = `${res}<small class="d-block">Closed at ${m.format("MMM DD H:mm a z")}</small>`
      }
      return res;
    }

    function getCloseTime(data, includeDate, kind) {
      if(!kind) kind='current';
      let market_time = data.market_time;
      if(kind=='pre') {
        market_time = data.pre_market_time;
      }

      if(market_time) {
        _format = '';
        if(includeDate) {
          _format = 'MMM DD ';
        }
        _format += 'H:mm a z';
        let tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        let m = moment(market_time*1000).tz(tz)
        return `${m.format(_format)}`
      }
      return ''
    }

    function parseInfo(data) {
      const quote = data.quoteData[data.symbol]
      const price = data.price
      let res = {
        code: data.symbol,
        name: quote.shortName,
        exchange: quote.fullExchangeName,
        price: quote.regularMarketPrice.raw,
        price_change: quote.regularMarketChange.raw,
        percent_change: quote.regularMarketChangePercent.raw,
        last_price: quote.regularMarketPreviousClose.raw,
        daily_high: quote.regularMarketDayHigh.raw,
        daily_low: quote.regularMarketDayLow.raw,
        volume: quote.regularMarketVolume.raw,
        market_time: quote.regularMarketTime.raw,
        currency: quote.currency,
        fiftytwo_week_high: quote.fiftyTwoWeekHigh.raw,
        fiftytwo_week_low: quote.fiftyTwoWeekLow.raw,
        pre_price: price.preMarketPrice?price.preMarketPrice.raw:undefined,
        pre_price_change: price.preMarketChange?price.preMarketChange.raw:undefined,
        pre_percent_change: price.preMarketChangePercent?price.preMarketChangePercent.raw:undefined,
        pre_market_time: price.preMarketTime?price.preMarketTime:undefined
      }

      res.prePriceChangeDisplay = res.pre_price?parsePriceChangeDisplay(res, 'pre'):''
      res.priceChangeDisplay = res.price?parsePriceChangeDisplay(res):''
      return res;
    }

    function calcDividendRate(stock) {
      let dividendRate = stock.dividendsPerShare
      switch (stock.dividendFrequency.toLowerCase()) {
        case 'monthly':
          dividendRate = stock.dividendsPerShare / 12;
          break;
        case 'quarterly':
          dividendRate = stock.dividendsPerShare / 4;
          break;
        case 'annually':
          break;
        case 'semi-annually':
          dividendRate = stock.dividendsPerShare / 2;
          break;
        default:
          try{
            const _d = parseInt(stock.dividendFrequency)
            if (isNaN(_d)||_d === 0) {
              dividendRate = stock.dividendsPerShare
            }else{
              dividendRate = stock.dividendsPerShare / _d
            }
          }catch(e) {
            dividendRate = stock.dividendsPerShare
          }
          
      }
      return dividendRate;
    }

    return {
      parse,
      parsePriceChangeDisplay,
      parseInfo,
      getCloseTime
    }
};

  