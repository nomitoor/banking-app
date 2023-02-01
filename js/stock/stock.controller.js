(function () {
  'use strict';

  angular.module("fm")
    .controller("StockController", StockController);

  StockController.$inject = ['$scope', '$rootScope', '$timeout', 'ApiService', 'StockService', 'YahooService', 'PermissionService'];

  function StockController($scope, $rootScope, $timeout, ApiService, StockService, YahooService, PermissionService){
    let vm = this;
    
    PermissionService.is_permit('stock') && activate();

    function activate() {
      console.log('[StockController] activate')
      vm.fields = StockService.STOCK_FIELDS;

      vm.stockCallback = {};
      vm.stockNote = '';
      vm.stockCallback.deleteStock = onDeleteStock;
      vm.addStock = addStock;
      vm.saveStock = saveStock;
      vm.deleteStock = deleteStock;
      vm.updateNote = updateNote;
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
            s = _.extend(s,stockInfo)
          })
        })

      StockService.getStockNote()
        .then(({data})=>{
          console.log(data)
          vm.stockNote = data.note
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
      return StockService.getStocks()
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

    function addStock() {
      vm.stocks.push({
        code:'',
        editing: true
      })

    }

    function saveStock(stock) {
      let f = null;
      stock.code = stock.code.toUpperCase();
      if(stock.id) { //update
        f = StockService.updateStock(stock.id, stock);
      } else {
        f = StockService.addStock(stock);
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
      StockService.deleteStock(stock.id)
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

    function updateNote(note) {
      StockService.updateStockNote({note})
        .then(data=>{
          console.log(data);
        })
        .catch(e=>{
          console.log(e);
        })
    }
  }
})();
