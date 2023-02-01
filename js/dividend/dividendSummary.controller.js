(function () {
  'use strict';

  angular.module("fm")
    .controller("DividendSummaryController", DividendSummaryController);

  DividendSummaryController.$inject = ['$scope', '$rootScope', '$timeout', 'StockService', 
    'YahooService', 'PermissionService', 'DividendService', 'ConfirmService', 'ToastService', 'SellStockService'];

  function DividendSummaryController($scope, $rootScope, $timeout, StockService, 
    YahooService, PermissionService, DividendService, ConfirmService, ToastService, SellStockService){
    let vm = this;
    
    PermissionService.is_permit('dividendstock') && activate();

    function activate() {
      console.log('[DividendSummaryController] activate')
      
      vm.fields = StockService.DIVIDEND_SUMMARY_FIELDS;
      vm.stockCallback = {};
      vm.stocks = [];
      vm.stockDividends = {};
      vm.averageYield = 0;
      vm.currentYear = 1;
      vm.currentPortfolio = null;
      vm.portfolioInvestment = 0;
      vm.portfolio = null;
      vm.portfolioOption = {};
      vm.months = ['Jan', 'Feb', 'Mar', 'Apr','May', 'Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      vm.eachYears = DividendService.generateYears() 
      vm.fiveYears = DividendService.generateYears(40, 5)
      vm.onChangeYear = onChangeYear;
      vm.sellStock = sellStock;
      vm.onChangePortfolio = onChangePortfolio;
    }
    
    function onChangePortfolio(portfolio) {
      if(!portfolio) return;
      vm.portfolio = portfolio;
      loadPortfolioStocks(portfolio.id)
    }
    function loadPortfolioStocks(portfolioId) {
      getStocks(portfolioId)
        .then(()=>{
          let symbols = _.map(vm.stocks, 'code');
          return YahooService.getQuote(symbols)
        }) 
        .then(()=>{
          let symbols = _.map(vm.stocks, 'code');
          return getYahooQuoteSummary(symbols)
        })
        .then(()=>{
          let symbols = _.map(vm.stocks, 'code');
          return getYahooChart(symbols)
        })
        .then(()=>{
          let symbols = _.map(vm.stocks, 'code');
          return getYahooHistory(symbols);
        })
        .then(()=>{
          console.log('getStocks then')
          _.each(vm.stocks, (s, i)=>{
            let stockInfo = YahooService.parseStock(s.code);
            s = _.extend(s, stockInfo)
            
            // override number of share
            s.numberOfShare = s.init_share
            // if frequency was override, force it
            if (s.dividend_frequency!=='auto') {
              s.dividendFrequency = s.dividend_frequency.charAt(0).toUpperCase() + s.dividend_frequency.slice(1)
            }
            
            s = transform(s);
            s = calculateProfitLost(s);

            let dividendInfo = DividendService.estimateDividend(s, s);
            vm.stockDividends[s.code] = dividendInfo;
            return stockInfo
          })
          $timeout(()=>{
            // calculateDividend()
            calculateAverageYield();
            calculateMonthlyIncome(vm.currentYear);
            calculateTotalInvestment();
            console.log(vm.stockDividends);
          },100);
          
        })
        .catch(err => {
          console.log("[intrinsic.controller] ", err);
        })
    }

    function getYahooQuoteSummary(symbols) {
      let queues = [];
      _.each(symbols, (s)=>{
        queues.push(YahooService.getQuoteSummary(s))
      })
      return Promise.all(queues).then(()=>{
        console.log('getYahooQuoteSummary then');
      })
    }
    function getYahooChart(symbols) {
      let queues = [];
      _.each(symbols, (s)=>{
        queues.push(YahooService.getChart(s))
      })
      return Promise.all(queues).then(()=>{
        console.log('getYahooChart then');
      })
    }
    function getYahooHistory(symbols) {
      let queues = [];
      _.each(symbols, (s)=>{
        queues.push(YahooService.getHistory(s))
      })
      return Promise.all(queues).then(()=>{
        console.log('getYahooChart then');
      })
    }

    function getStocks(portfolioId) {
      return StockService.getDividendStocks({portfolio: portfolioId})
        .then( ({results}) => {
          vm.stocks = results;
        })
    }
    
    function transform(stock) {
      let realInitAmount = stock.init_amount - stock.commission;
      stock.numberOfShare = Math.floor(realInitAmount/stock.currentStockPrice);

      stock.forwardDividend = 0;//stock.dividendsPerShare;
      stock = DividendService.transformDividendsPerShare(stock);
      stock.year = 40; //force year to 40
      switch (stock.dividendFrequency.toLowerCase()) {
        case 'monthly':
          stock.tick = 12;
          break;
        case 'quarterly':
          stock.tick = 4;
          break;
        case 'annually':
          stock.tick = 1;
          break;
        case 'semi-annually':
          stock.tick = 2;
          break;
      }
      // payment date
      stock.tickMargin = 0;
      if (stock.dividendDate && stock.dividendDate !== 'N/A') {
        const m = moment(stock.dividendDate).month()
        stock.tickMargin = m % (12 / stock.tick);
      }
      return stock;
    }
    
    function calculateProfitLost(stock) {
      stock.profit_or_lost = stock.currentStockPrice - stock.init_price
      stock.profit_or_lost_percent = _.round(100*(stock.currentStockPrice - stock.init_price)/stock.init_price, 2)
      return stock
    }

    function calculateAverageYield() {
      let totalAmount = 0;
      vm.monthlyReceived = {};
      vm.yearlyReceived = [0,0];

      totalAmount = _.sumBy(vm.stocks, stock => stock.init_amount)

      _.each(vm.stocks, (stock)=>{
        stock.percentageProfilio = _.round(100*(stock.init_amount/totalAmount),2);
      })
      vm.averageYield = _.round(_.sumBy(vm.stocks, stock => stock.dividendYield)/vm.stocks.length,2)

    }
    function calculateTotalInvestment () {
      vm.portfolioInvestment = _.sumBy(vm.stocks, function(stock) {
        return stock.init_share * stock.currentStockPrice
      });
    }

    function calculateMonthlyIncome(year) {
      vm.monthlyReceived = {};
      vm.yearlyReceived = [0,0];
      _.each(vm.stocks, (stock)=>{
        for(let m=0;m<12;m++) {
          if(m%(12/stock.tick)-stock.tickMargin===0) {
            if(!vm.monthlyReceived[m]) {
              vm.monthlyReceived[m] = [0,0]
            }
            const index = (((year-1)*12)+m-stock.tickMargin)/(12/stock.tick)
            if (vm.stockDividends[stock.code][index]) {
              const woDrip = vm.stockDividends[stock.code][index].dividendCash;
              const drip = vm.stockDividends[stock.code][index].dividendCashDrip;
              vm.monthlyReceived[m][0] += woDrip;
              vm.monthlyReceived[m][1] += drip;
              vm.yearlyReceived[0] += woDrip;
              vm.yearlyReceived[1] += drip;
            }
          }
        }
      })
    }
    function onChangeYear(y) {
      console.log(y);
      calculateMonthlyIncome(y)
    }
    function sellStock(stock) {
      SellStockService.show(stock, vm.portfolio)
        .then(()=>{
          console.log('sell then')
          // refresh portfolio
          if (vm.portfolioOption && vm.portfolioOption.refresh) {
            vm.portfolioOption.refresh()
          }
        })
        .catch(()=>{
          console.log('sell cache')
        })
        
      // ConfirmService.show({
      //   content: `Do you want to remove stock ${stock.code} (${stock.displayName})`
      // })
      //   .then(()=>{
      //     StockService.deleteDividendStock(stock.id)
      //       .then(res => {
      //         ToastService.success({
      //           title: 'Remove stock success',
      //           body: 'The stock has been removed from your porfolio'
      //         })
      //         _.remove(vm.stocks, (s => s.id===stock.id))
      //       })
      //       .catch(err => {
      //         ToastService.danger({
      //           title: 'Remove stock failed',
      //           body: 'There is an issue when removing stock from your portfolio'
      //         })
      //       })
      // })
    }
    
  }
})();
