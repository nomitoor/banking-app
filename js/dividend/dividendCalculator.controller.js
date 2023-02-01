(function () {
  'use strict';

  angular.module("fm")
    .controller("DividendCalculatorController", DividendCalculatorController);

  DividendCalculatorController.$inject = ['$scope', '$rootScope', '$timeout', '$filter', 'ApiService', 'StockService', 'YahooService', 'PermissionService'];

  function DividendCalculatorController($scope, $rootScope, $timeout, $filter, ApiService, StockService, YahooService, PermissionService){
    let vm = this;
    
    PermissionService.is_permit('dividendstock') && activate();

    function activate() {
      console.log('[DividendCalculatorController] activate')
      
      vm.fields = StockService.DIVIDEND_FIELDS;
      vm.stockCallback = {};
      vm.stocks = [];
      vm.averageYield = 0;
      vm.stockCallback.deleteStock = onDeleteStock;
      vm.addStock = addStock;
      vm.saveStock = saveStock;
      vm.deleteStock = deleteStock;

      getStocks()
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
            stockInfo = transform(stockInfo);
            s = _.extend(s,stockInfo)
          })
          $timeout(()=>{
            CalculateDividend()
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

    function getStocks() {
      return StockService.getDividendStocks()
        .then( ({results}) => {
          vm.stocks = results;
        })
    }
    
    

    function getYahooSingleQuote(stock) {
      return YahooService.getQuote([stock.code])
        .then(() => {
          return getYahooQuoteSummary([stock.code])
        })
        .then(() => {
          return getYahooChart([stock.code])
        })
        .then(()=>{
          return getYahooHistory([stock.code])
        })
        
        .then(()=>{
          let stockInfo = YahooService.parseStock(stock.code);
          $timeout(()=>{
            stock = _.extend(stock, stockInfo);  
            stock = transform(stock);
            CalculateDividend();
          },100)
        })
        .catch((err)=>{
          console.log('Yahoo API Error');
          console.log(err);
        })
      
    }

    function clearStock(stock) {
      //clear stock
      console.log('Clear stock');
      _.each(vm.fields, (f)=>{
        if(stock[f.field]) {
          stock[f.field] = 'N/A';
        }
      })
    }

    function transform(stock) {
      stock.forwardDividend = 0;//stock.dividendsPerShare;
      switch (stock.dividendFrequency.toLowerCase()) {
        case 'monthly':
          stock.dividendsPerShare = stock.dividendsPerShare / 12;
          // stock.dividendYield = stock.dividendYield / 12;
          break;
        case 'quarterly':
          stock.dividendsPerShare = stock.dividendsPerShare / 4;
          // stock.dividendYield = stock.dividendYield / 4;
          break;
        case 'annually':
          break;
        case 'semi-annually':
          stock.dividendsPerShare = stock.dividendsPerShare / 2;
          // stock.dividendYield = stock.dividendYield / 2;
          break;

      }
      return stock;
    }
    function culculateAverageYield() {
      let totalAmount = _.sumBy(vm.stocks, (stock)=>{
        return stock.init_amount;
      });
      let sumProduct = _.sumBy(vm.stocks, (stock)=>{
        return stock.init_amount*stock.forwardDividend;
      })
      
      vm.averageYield = _.round(sumProduct/totalAmount,2)
    }

    function addStock() {
      let _stock = {
        code:'',
        editing: true,
        commission: 9.99,
        exchange: "N/A"
      }
      vm.stocks.push(_stock)

    }

    function saveStock(stock) {
      let f = null;
      stock.code = stock.code.toUpperCase();
      if(stock.id) { //update
        f = StockService.updateDividendStock(stock.id, stock);
      } else {
        f = StockService.addDividendStock(stock);
      }

      return f.then(({data})=>{
        stock.editing = false;
        if (!stock.id) {
          stock.id = data.id;
        }
        clearStock(stock);
        getYahooSingleQuote(stock);
      })

      
    }
    function deleteStock(stock) {
      StockService.deleteDividendStock(stock.id)
        .then(()=>{
          stock.editing = false;
          _.remove(vm.stocks, ['id', stock.id]);
        })
        .catch((err)=>{

        })
      
    }

    function onDeleteStock(stock) {
      _.remove(vm.stocks, ['id', stock.id]);
    }

  
    function CalculateDividend(stock) {
      culculateAverageYield();
    }

    
  }
})();
