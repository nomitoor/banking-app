(function () {
  'use strict';

  angular.module("fm")
    .controller("DatabankController", DatabankController);

  DatabankController.$inject = ['$scope', '$rootScope', '$timeout', '$filter', 'ApiService', 'StockService',
    'YahooService', 'PermissionService', 'Databank', 'Screener', 'Watchlist', 'Broadcast', 'StockParser', 
    'ToastService', 'ConfirmService', 'StockList', 'BuyStockService'];

  function DatabankController($scope, $rootScope, $timeout, $filter, ApiService, StockService, 
    YahooService, PermissionService, Databank, Screener, Watchlist, Broadcast, StockParser,
    ToastService, ConfirmService, StockList, BuyStockService){
    let vm = this;
    
    PermissionService.is_permit('databank') && activate();

    function activate() {
      console.log('[DatabankController] activate')
      vm.stocks = [];
      vm.total = 0;
      vm.currentPage = 1;
      vm.showing = '';
      vm.pageSize = 50;
      vm.isEdit = false;
      vm.pagingCallback = {};
      vm.newStock = {};
      vm.order = 'code';
      vm.closeAt = '';
      vm.currentStockList = null;
      vm.filter = {
        sector: '--All Sector--',
        industry: '--All Industry--'
      };
      vm.showAddDatabankModal = false;
      vm.databankModalAction = 'new';

      vm.stockListOptions = {};
      vm.pagingCallback.goBack = goBack;
      vm.pagingCallback.goNext = goNext;
      vm.filterDatabank = filterDatabank;
      vm.addStock = addStock;
      vm.deleteStock = deleteStock;
      vm.syncInfo = syncInfo2;
      vm.addToWatchlist = addToWatchlist;
      vm.addToScreener = addToScreener;
      vm.reorder = reorder;
      vm.onChangeList = onChangeList;
      vm.addDatabank = addDatabank;
      vm.updateDatabank = updateDatabank;
      vm.removeDatabank = removeDatabank;

      vm.onNewDatabank = onNewDatabank;
      vm.buy = buy;

      Databank.sectors()
        .then(({data})=>{
          vm.sectors = data||[];
          vm.sectors.unshift('--All Sector--')
        })
      Databank.industries()
        .then(({data})=>{
          vm.industries = data||[];
          vm.industries.unshift('--All Industry--')
        })
      
        Broadcast.on('BODY_CLICKED', ()=>{
        $timeout(()=>{
          _.each(vm.stocks, (stock)=>{
            stock.showAction = false
          });
        })
      })

      // getDatabanks()
      //   .then(()=>{
      //     if(vm.stocks.length>0) {
      //       vm.closeAt = StockParser.getCloseTime(vm.stocks[0]);
      //     }
      //   })
    }
    
   
    function getDatabanks(filter) {
      let query = {
        page_size: vm.pageSize,
        page: vm.currentPage
      }
      if (filter) {
        query = _.extend(query, filter)
        if(filter.sector && filter.sector.indexOf('--')==0) delete query.sector;
        if(filter.industry && filter.industry.indexOf('--')==0) delete query.industry;
      }
      if(vm.order) {
        query.ordering = vm.order;
      }
      return Databank.getAll(query)
        .then(data => {
          vm.total = data.count;
          vm.stocks = parseStocks(data.results);
          vm.showing = `${(vm.currentPage-1)*vm.pageSize+1} - ${(vm.currentPage-1)*vm.pageSize+vm.pageSize-1}`;
          return vm.stocks;
        })
        .then((stocks)=>{
          $timeout(async ()=>{
            for (const stock of stocks) {
              if(!stock.updated_at || moment().diff(moment(stock.updated_at),'minutes') > 60 ) {
                await syncInfo2(stock);
              }
            }
          },200)          
        })
    }

    function parseStocks(stocks) {
      _.each(stocks, (stock)=>{
        stock.priceChangeDisplay = StockParser.parsePriceChangeDisplay(stock)
      })
      return stocks;
    }

    function goBack() {
      vm.currentPage--;
      getDatabanks();
    }

    function goNext() {
      vm.currentPage++;
      getDatabanks();
    }

    function filterDatabank(filter) {
      vm.currentPage = 1;
      getDatabanks(filter);
    }

    function addStock(newStock) {
      if(!vm.filter.stock_list){
        ToastService.danger({
          title: 'Add stock failed',
          body: 'Please choose a list and add again'
        })
        return;
      }
      let data = {
        code: newStock.stock.symbol,
        name: newStock.stock.shortname,
        stock_list: vm.filter.stock_list
      }
      Databank.create(data)
        .then(({data})=>{
          data.new = true;
          _.each(vm.stocks,stock=>stock.new=false);
          vm.stocks.unshift(data);
          if(vm.total>vm.pageSize) {
            vm.stocks.pop();
          }
          syncInfo2(data);
          ToastService.success({
            title: 'Add stock success',
            body: 'The stock has been added to your databank'
          })
        })
        .catch(({data})=>{
          let msg = 'Failed to add the stock to your databank';
          if (data && data.non_field_errors) {
            msg = 'This stock is already exist in your databank';
          };
          ToastService.danger({
            title: 'Add stock failed',
            body: msg
          })
        })
    }
    function deleteStock(stock) {
      ConfirmService.show()
        .then(()=>{
          Databank.remove(stock.id)
            .then(()=>{
              _.remove(vm.stocks, (s)=>{
                return s.code === stock.code;
              })
              vm.total--;
              ToastService.success({
                title: 'Delete stock success',
                body: 'The stock has been deleted from your databank'
              })
            })
            .catch(({data})=>{
              let msg = 'Failed to add the stock to your databank';
              ToastService.danger({
                title: 'Add stock failed',
                body: msg
              })
            })
        })
    }

    function addToWatchlist(stock, $event) {
      $event.stopPropagation();
      stock.showAction = false;
      let data = _.clone(stock)
      data.id = undefined;
      Watchlist.create(data)
        .then(({data})=>{
          ToastService.success({
            title: 'Add stock success',
            body: 'The stock has been added to your watchlist'
          })
        })
        .catch(({data})=>{
          let msg = 'Failed to add the stock to your watchlist';
          if (data && data.non_field_errors) {
            msg = 'This stock is already exist in your watchlist';
          };
          ToastService.danger({
            title: 'Add stock failed',
            body: msg
          })
        })
    }
    function addToScreener(stock, $event) {
      $event.stopPropagation();
      stock.showAction = false;
      let data = _.clone(stock)
      data.id = undefined;
      Screener.create(data)
        .then(({data})=>{
          ToastService.success({
            title: 'Add stock success',
            body: 'The stock has been added to your screener'
          })
        })
        .catch(({data})=>{
          let msg = 'Failed to add the stock to your screener';
          if (data && data.non_field_errors) {
            msg = 'This stock is already exist in your screener';
          };
          ToastService.danger({
            title: 'Add stock failed',
            body: msg
          })
        })
    }
    function reorder(field) {
      if(vm.order==field) {
        vm.order = `-${field}`
      }else {
        vm.order = field;
      }
      vm.currentPage = 1;
      getDatabanks();
    }

    function syncInfo2(stock) {
      const symbol = stock.code;
      let _stockData = {};
      stock.syncing = true;
      return Promise.all([
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
          return _stockData;
        })
        .then((_stockData)=>{
          return Object.assign(stock, transform(_stockData))
        })
        .then((stock)=>{
          return Databank.partialUpdate(stock.id, stock)
        })
        .finally(()=>{
          $timeout(()=>{
            stock.syncing = false;
          })          
        })
    }

    function transform(_stockData) {
      let res = _.pick(_stockData, ['sector', 'industry', 'volume', 'exchange', 'currency', 
        'pre_price', 'pre_price_change', 'pre_percent_change', 'pre_market_time'])
      res = Object.assign(res, {
        name: _stockData.displayName,
        price: _stockData.currentStockPrice,
        volume: _stockData.dailyVoume,
        price_change: _stockData.priceChange,
        percent_change: _stockData.priceChangePercentage,
        market_time: _stockData.marketTime,
        daily_high: _stockData.dailyHigh,
        daily_low: _stockData.dailyLow,
        fiftytwo_week_low: _stockData.fiftyTwoWeekLow,
        fiftytwo_week_high: _stockData.fiftyTwoWeekHigh,

        dividend_frequency: _stockData.dividendFrequency,
        dividend_rate: _stockData.dividendRate,
        dividend_yield: _.isNumber(_stockData.dividendYield)?_stockData.dividendYield:undefined,
        ex_dividend_date: _.isDate(_stockData.exDividendDate)?moment(_stockData.exDividendDate).format('YYYY-MM-DD'): undefined,
        payment_date: _.isDate(_stockData.dividendDate)?moment(_stockData.dividendDate).format('YYYY-MM-DD'): undefined
      })
      
      return res;
    }

    function onChangeList(newList) {
      vm.currentStockList = newList
      if(newList) {
        getDatabanks(vm.filter)
      }
    }

    function addDatabank() {
      vm.databankModalAction = 'new';
      vm.showAddDatabankModal = true;
    }

    function updateDatabank() {
      vm.databankModalAction = 'update';
      vm.showAddDatabankModal = true;
    }
    function removeDatabank() {
      ConfirmService.show({
        content: `Do you want to delete Databank ${vm.currentStockList.name}`
      })
        .then(()=>{
          StockList.remove(vm.currentStockList.id)
            .then(()=>{
              ToastService.success({
                title: 'Delete Databank',
                body: 'Your databank has been deleted'
              })
              vm.stockListOptions.refresh()
            })
            .catch(()=>{
              ToastService.danger({
                title: 'Delete Watchlist',
                body: 'Failed to delete your watchlist'
              })
            })
         
        })
    }

    function onNewDatabank(data) {
      console.log("onNewDatabank:", data)
      vm.stockListOptions.refreshAndSelect(data.id)
    }

    function buy(stock) {
      BuyStockService.show(stock)
        .then(()=>{
          console.log('buy then')
        })
        .catch(()=>{
          console.log('buy cache')
        })
    }
  }
})();
