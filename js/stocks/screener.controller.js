(function () {
  'use strict';

  angular.module("fm")
    .controller("ScreenerController", ScreenerController);

  ScreenerController.$inject = ['$scope', '$rootScope', '$timeout', 'Screener', 'StockService', 'YahooService', 'PermissionService',
  'ToastService', 'StockParser', 'ConfirmService', 'Watchlist', 'Databank', 'Broadcast', 'BuyStockService'];

  function ScreenerController($scope, $rootScope, $timeout, Screener, StockService, YahooService, PermissionService,
    ToastService, StockParser, ConfirmService, Watchlist, Databank, Broadcast, BuyStockService){
    let vm = this;
    
    PermissionService.is_permit('screener') && activate();

    function activate() {
      console.log('[ScreenerController] activate')
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
      vm.filter = {
        sector: '--All Sector--',
        industry: '--All Industry--'
      };
      vm.pagingCallback.goBack = goBack;
      vm.pagingCallback.goNext = goNext;
      vm.filterScreener = filterScreener;
      vm.addStock = addStock;
      vm.deleteStock = deleteStock;
      vm.syncInfo = syncInfo;
      vm.addToWatchlist = addToWatchlist;
      vm.addToDatabank = addToDatabank;
      vm.reorder = reorder;
      vm.buy = buy;
      getScreeners()
        .then(()=>{
          if(vm.total>0) {
            let usStock = _.find(vm.stocks, (s=>s.pre_price))
            if(usStock) {
              getMarketTime(usStock)
            }else {
              getMarketTime(vm.stocks[0])
            }
          }
        })
      Screener.sectors()
        .then(({data})=>{
          vm.sectors = data||[];
          vm.sectors.unshift('--All Sector--')
        })
      Screener.industries()
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
    }

    function getScreeners(filter) {
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
      return Screener.getAll(query)
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
                await syncInfo(stock);
              }
            }
          },200)          
        })
    }

    function parseStocks(stocks) {
      _.each(stocks, (stock)=>{
        stock.prePriceChangeDisplay = StockParser.parsePriceChangeDisplay(stock, 'pre')
      })
      return stocks;
    }

    function goBack() {
      vm.currentPage--;
      getScreeners();
    }

    function goNext() {
      vm.currentPage++;
      getScreeners();
    }


    function filterScreener(filter) {
      vm.currentPage = 1;
      getScreeners(filter);
    }
   
    function addStock(newStock) {
      let data = {
        code: newStock.stock.symbol,
        name: newStock.stock.shortname
      }
      Screener.create(data)
        .then(({data})=>{
          data.new = true;
          _.each(vm.stocks,stock=>stock.new=false);
          vm.stocks.unshift(data);
          if(vm.total>vm.pageSize) {
            vm.stocks.pop();
          }
          syncInfo(data);
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
    function deleteStock(stock) {
      ConfirmService.show()
        .then(()=>{
          Screener.remove(stock.id)
            .then(()=>{
              _.remove(vm.stocks, (s)=>{
                return s.code === stock.code;
              })
              vm.total--;
              ToastService.success({
                title: 'Delete stock success',
                body: 'The stock has been deleted from your screener'
              })
            })
            .catch(({data})=>{
              let msg = 'Failed to add the stock to your screener';
              ToastService.danger({
                title: 'Add stock failed',
                body: msg
              })
            })
        })
    }

    function syncInfo(stock) {
      if(stock.syncing) return;
      stock.syncing = true;
      return StockService.stockInfo(stock.code)
        .then(({data})=>{
          console.log(data)
          let d = StockParser.parseInfo(data)
          return _.extend(stock, d)
        })
        .then((stock)=>{
          console.log('Synced');
          if (!stock.sector || !stock.industry) {
            return StockService.stockProfile(stock.code)
              .then(({data})=>{
                console.log('--------data', data)
                stock.sector = data.assetProfile.sector?data.assetProfile.sector.replace('Services',''):''
                stock.industry = data.assetProfile.industry?data.assetProfile.industry.split('—')[0]:''
                return stock;
              })
          }
          return stock;
        })
        .then((stock)=>{
          return Screener.partialUpdate(stock.id, stock)
        })
        .finally(()=>{
          stock.syncing = false;
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
    function addToDatabank(stock) {
      $event.stopPropagation();
      stock.showAction = false;
      let data = _.clone(stock)
      data.id = undefined;
      Databank.create(data)
        .then(({data})=>{
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
    function reorder(field) {
      if(vm.order==field) {
        vm.order = `-${field}`
      }else {
        vm.order = field;
      }
      vm.currentPage = 1;
      getScreeners();
    }

    function getMarketTime(stock) {
      vm.closeAt = StockParser.getCloseTime(stock);
      vm.preCloseAt = StockParser.getCloseTime(stock, false, 'pre');
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
