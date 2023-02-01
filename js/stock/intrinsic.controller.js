(function () {
  'use strict';

  angular.module("fm")
    .controller("IntrinsicController", IntrinsicController);

  IntrinsicController.$inject = ['$scope', '$rootScope', '$timeout', '$filter', 'ApiService', 'StockService', 'YahooService', 'PermissionService'];

  function IntrinsicController($scope, $rootScope, $timeout, $filter, ApiService, StockService, YahooService, PermissionService){
    let vm = this;
    let FIXED = {
      fixedPE: 7,
      fixed1G: 1,
      fixedCorpBond: 4.4
    }
    let BOND_YIELD = 1;
    PermissionService.is_permit('intrinsicstock') && activate();

    function activate() {
      console.log('[IntrinsicController] activate')
      vm.fields = StockService.INTRINSIC_FIELDS;

      vm.stockCallback = {};
      
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
          return StockService.getBondYield()
            .then(({results})=>{
              if(results && results.length) {
                BOND_YIELD = results[0].value;
                updateBondYieldField(results[0]);
              }
            })
        })
        .then(()=>{
          console.log('getStocks then')
          _.each(vm.stocks, (s, i)=>{
            let stockInfo = YahooService.parseStock(s.code);
            s = _.extend(s,stockInfo)
          })
          $timeout(()=>{
            grahamCalculate()
          },100);
          
        })
        .catch(err => {
          console.log("[intrinsic.controller] ", err);
        })
    }
    function updateBondYieldField(data) {
      _.each(vm.fields, (f)=>{
        if(f.field=="bondYield") {
          let _date = $filter('date')(data.date, 'yyyy-MM-dd')
          f.name = `${f.name} (${_date})`
        }
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
      return StockService.getIntrinsicStocks()
        .then( ({results}) => {
          vm.stocks = setFixedValues(results);
        })
    }
    function setFixedValues(stocks) {
      _.each(stocks, (stock)=>{
        stock = setFixedValue(stock);
      })
      return stocks;
    }
    function setFixedValue(stock) {
      stock.fixedPE = FIXED.fixedPE;
      stock.fixed1G = FIXED.fixed1G;
      stock.fixedCorpBond = FIXED.fixedCorpBond;
      return stock;
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
          if (BOND_YIELD!=1) {
            return true;
          }
          return StockService.getBondYield()
            .then(({results})=>{
              if(results && results.length) {
                BOND_YIELD = results[0].value;
                updateBondYieldField(results[0]);
              }
            })
        })
        .then(()=>{
          let stockInfo = YahooService.parseStock(stock.code);
          $timeout(()=>{
            stock = _.extend(stock, stockInfo);  
            grahamCalculate(stock);
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
      stock = setFixedValue(stock);
    }

    function addStock() {
      let _stock = {
        code:'',
        editing: true
      }
      _stock = setFixedValue(_stock)
      vm.stocks.push(_stock)

    }

    function saveStock(stock) {
      let f = null;
      stock.code = stock.code.toUpperCase();
      if(stock.id) { //update
        f = StockService.updateIntrinsicStock(stock.id, stock);
      } else {
        f = StockService.addIntrinsicStock(stock);
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
      StockService.deleteIntrinsicStock(stock.id)
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

    function grahamCalculate(stock) {
      if(stock) {
        stock.bondYield = BOND_YIELD;
        stock.intrinsic = (stock.trailingEPS * (stock.fixedPE + (stock.fixed1G * stock.netIncomeForecast))* stock.fixedCorpBond)/stock.bondYield;
        stock.buy_or_sale = stock.intrinsic > stock.currentStockPrice?'BUY':'SALE';
        stock.upside = 100 * (stock.intrinsic / stock.currentStockPrice - 1)
        return;
      }
      _.each(vm.stocks, (stock)=>{
        stock.bondYield = BOND_YIELD;
        stock.intrinsic = (stock.trailingEPS * (stock.fixedPE + (stock.fixed1G * stock.netIncomeForecast))* stock.fixedCorpBond)/stock.bondYield;
        stock.buy_or_sale = stock.intrinsic > stock.currentStockPrice?'BUY':'SALE';
        stock.upside = 100 * (stock.intrinsic / stock.currentStockPrice - 1)
      })
    }
  }
})();
