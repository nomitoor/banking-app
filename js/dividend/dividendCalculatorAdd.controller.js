(function () {
  'use strict';

  angular.module("fm")
    .controller("DividendCalculatorAddController", DividendCalculatorAddController);

  DividendCalculatorAddController.$inject = ['$scope', '$rootScope', '$timeout', '$filter', 
    '$location', 'ApiService', 'StockService', 'StockParser', 'PermissionService', 'ToastService', 
    'DividendService', 'AnchorService', 'Broadcast', 'Databank', 'Screener', 'Watchlist', 'BuyStockService', 'Portfolio'];

  function DividendCalculatorAddController($scope, $rootScope, $timeout, $filter, 
    $location, ApiService, StockService, StockParser, PermissionService, ToastService, 
    DividendService, AnchorService, Broadcast, Databank, Screener, Watchlist, BuyStockService, Portfolio){
    let vm = this;
    
    PermissionService.is_permit('dividendstock') && activate();

    function activate() {
      console.log('[DividendCalculatorAddController] activate')
      
      vm.newStock = {
        commission: 9.99,
        year: 40,
        dividend_frequency: 'auto',
        initType: 'cash'
      }
      vm.fields = StockService.DIVIDEND_SUMMARY_FIELDS;
      vm.stockData = {};
      vm.calculatedData = {};
      vm.dividends = [];
      vm.initDividend = {};
      vm.currentPortfolio = null;
      vm.loading = false;
      vm.addToDd = false;
      vm.showAddFundModal = false;
      vm.portfolioOption = {};
      vm.fiveYears = DividendService.generateYears(40,5)
      vm.calculate = calculate;
      vm.goto = AnchorService.goto;
      vm.addToDatabank = addToDatabank;
      vm.addToWatchlist = addToWatchlist;
      vm.addToScreener = addToScreener;
      vm.print = print;
      vm.onChangePortfolio = onChangePortfolio;
      vm.buy = buy;
      vm.onAddFund = onAddFund;

      Broadcast.on('BODY_CLICKED', ()=>{
        if(vm.addToDd) {
          vm.addToDd = false;
        }
      })
    }

    function onChangePortfolio(p) {
      vm.currentPortfolio = p;
    }

    function calculate() {
      if(!vm.newStockForm.$valid || vm.loading)return;
      let symbol = vm.newStock.stock.symbol;
      vm.newStock.code = symbol;
      if(vm.newStock.initType==='share') {
        vm.newStock.init_amount = _.round((vm.newStock.init_share * vm.newStock.init_price) + vm.newStock.commission, 2)
      }
      vm.loading = true;
      vm.calculatedData = _.extend({}, vm.newStock);
      vm.calculatedData.balance = vm.currentPortfolio.balance
      vm.stockData = {};
      let _stockData = {};

      Promise.all([
        StockService.stockInfo(symbol)
          .then(({data})=>{
            // console.log(data)
            _stockData.summary = data;
          }),
        StockService.stockChart(symbol)
          .then(({data})=>{
            // console.log(data)
            _stockData.chart = data;
        }),
        StockService.stockProfile(symbol)
          .then(({data})=>{
            // console.log(data)
            _stockData.profile = data;
        }),
        StockService.stockFinances(symbol)
          .then(({data})=>{
            // console.log(data);
            _stockData.finances = data;
          })
        ])
        .then(()=>{
          //merge 
          let merge = ['balanceSheetHistory', 'balanceSheetHistoryQuarterly', 'cashflowStatementHistory', 'cashflowStatementHistoryQuarterly', 
                  'incomeStatementHistory', 'incomeStatementHistoryQuarterly']
          _.each(merge, (item)=>{
            _stockData.summary[item] = _stockData.finances[item];
          })
          _stockData.summary.assetProfile = _stockData.profile.assetProfile;
          
          _stockData = StockParser.parse(_stockData);
          
          // override dividendFrequency
          if (vm.calculatedData.dividend_frequency !='auto') {
            _stockData.dividendFrequency = vm.calculatedData.dividend_frequency
          }
          // override stock price
          if (vm.calculatedData.initType === 'share') {
            _stockData.currentStockPrice = vm.calculatedData.init_price
          }

          // test mock:
          // _stockData.currentStockPrice = 82.76
          // _stockData.dividendsPerShare - 3.6
          _stockData = transform(_stockData, vm.calculatedData)
          return _stockData;
        })
        .then((_stockData)=>{
          $timeout(()=>{
            vm.stockData = _stockData;
            vm.initDividend = DividendService.getInitDividend(_stockData, vm.calculatedData);
            vm.dividends = DividendService.estimateDividend(_stockData, vm.calculatedData);
          })
        })
        .catch((err) => {
          console.log(err)
          ToastService.danger({
            title: 'Failed to calculate',
            body: 'We can not get stock information now, please try again later'
          })
        })
        .finally(()=>{
          vm.loading = false;
        })
    }
    
    function transform(stock, calculatedData) {
      let realInitAmount = calculatedData.init_amount-calculatedData.commission;

      stock.numberOfShare = Math.floor(realInitAmount/stock.currentStockPrice);

      stock.forwardDividend = 0; // zero now //stock.dividendYield;
      stock = DividendService.transformDividendsPerShare(stock)
      stock.code = calculatedData.code;
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
      return stock;
    }

    function pickExtraData(code) {
      if (code !== vm.stockData.code) {
        return {}
      }
      let res = {
        name: vm.stockData.displayName,
        sector: vm.stockData.sector,
        exchange: vm.stockData.exchange,
        last_price: vm.stockData.lastPrice,
        price: vm.stockData.currentStockPrice,
        price_change: vm.stockData.priceChange,
        percent_change: vm.stockData.priceChangePercentage,
        daily_high: vm.stockData.dailyHigh,
        daily_low: vm.stockData.dailyLow,
        volume: vm.stockData.dailyVolume,
        dividend_frequency: 0,
        dividend_rate: vm.stockData.dividendsPerShare,
        dividend_yield: vm.stockData.dividendYield,
        ex_dividend_date: _.isDate(vm.stockData.exDividendDate)? moment(vm.stockData.exDividendDate).format('YYYY-MM-DD'): undefined,
        payment_date: _.isDate(vm.stockData.dividendDate)? moment(vm.stockData.dividendDate).format('YYYY-MM-DD'): undefined
      }
      switch(vm.stockData.dividendFrequency.toLowerCase()) {
        case 'monthly':
          res.dividend_frequency = 1;
          break;
        case 'quarterly':
          res.dividend_frequency = 2;
          break;
        case 'semi-annually':
          res.dividend_frequency = 3;
          break;
        case 'annually':
          res.dividend_frequency = 4;
          break;
      }
      return res;
    }

    function addToDatabank() {
      if(!vm.newStockForm.$valid) {
        return;
      }
      let data = _.clone(vm.newStock)
      data = _.extend(data, pickExtraData(data.code))
      Databank.create(data)
        .then(()=>{
          ToastService.success({
            title: 'Add stock to databank',
            body: 'The stock and been add to your databank'
          })
        })
        .catch(({data})=>{
          let msg = 'There is an issue when adding stock to your databank';
          if (data && data.non_field_errors) {
            msg = 'This stock is already exist in your databank';
          }
          ToastService.danger({
            title: 'Add stock failed',
            body: msg
          })
        })
    }
    function addToScreener() {
      if(!vm.newStockForm.$valid) {
        return;
      }
      let data = _.clone(vm.newStock)
      data = _.extend(data, pickExtraData(data.code))

      Screener.create(data)
        .then(()=>{
          ToastService.success({
            title: 'Add stock success',
            body: 'The stock and been add to your screener'
          })
          
        })
        .catch(({data})=>{
          let msg = 'There is an issue when adding stock to your screener';
          if (data && data.non_field_errors) {
            msg = 'This stock is already exist in your screener';
          }
          ToastService.danger({
            title: 'Add stock failed',
            body: msg
          })
        })
    }
    function addToWatchlist() {
      if(!vm.newStockForm.$valid) {
        return;
      }
      let data = _.clone(vm.newStock)
      data = _.extend(data, pickExtraData(data.code))
      Watchlist.create(data)
        .then(()=>{
          ToastService.success({
            title: 'Add stock success',
            body: 'The stock and been add to your watchlist'
          })
          
        })
        .catch(({data})=>{
          let msg = 'There is an issue when adding stock to your watchlist';
          if (data && data.non_field_errors) {
            msg = 'This stock is already exist in your watchlist';
          }
          ToastService.danger({
            title: 'Add stock failed',
            body: msg
          })
        })
    }
    function print() {
      let includes = ['css/app.css', 'libs/bootstrap.min.css', 'css/printjs.css']
      if (ENV && ENV=='production') {
        includes = ['/app.min.css', 'css/bootstrap.min.css', 'css/printjs.css']
      }
      printJS({
        printable: 'dividendCalculatorResult',
        type: 'html',
        css: includes,
        maxWidth: '1024px',
        targetStyles: ["*"]
      })

    }

    function buy() {
      if(!vm.newStockForm.$valid) {
        return;
      }
      if (vm.newStock.stock) {
        vm.newStock.code = vm.newStock.stock.symbol
      }
      if (vm.newStock.initType === 'cash') {
        vm.newStock.init_price = vm.initDividend.currentStockPrice
        vm.newStock.init_share = vm.initDividend.numberOfShare
      }

      BuyStockService.show(vm.newStock.stock, vm.newStock, vm.initDividend, vm.currentPortfolio)
        .then(()=>{
          console.log('buy then')
        })
        .catch(()=>{
          console.log('buy cache')
        })
    }

    function onAddFund(amount, portfolio) {
      Portfolio.addBalance(vm.currentPortfolio.id, {amount})
      .then(res => {
        ToastService.success({
          title: 'Add Fund',
          body: 'Your portfolio has been updated new balance'
        })
        vm.showAddFundModal = false;
        if(vm.portfolioOption && vm.portfolioOption.refresh) {
          vm.portfolioOption.refresh()
        }
      })
      .catch(err => {
        console.log(err);
        ToastService.danger({
          title: 'Add Fund',
          body: "Your amount is not valid or you don't have permission on this portfolio"
        })
      })
      
    }
  }
})();
