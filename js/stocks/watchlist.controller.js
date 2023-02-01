(function () {
  'use strict';

  angular.module("fm")
    .controller("WatchlistController", WatchlistController);

  WatchlistController.$inject = ['$scope', '$rootScope', '$timeout', 'Screener', 'StockService', 'YahooService', 'PermissionService',
  'ToastService', 'StockParser', 'ConfirmService', 'Watchlist', 'Databank', 'Broadcast', 'StockList', 'BuyStockService'];

  function WatchlistController($scope, $rootScope, $timeout, Screener, StockService, YahooService, PermissionService,
    ToastService, StockParser, ConfirmService, Watchlist, Databank, Broadcast, StockList, BuyStockService){
    let vm = this;
    
    PermissionService.is_permit('watchlist') && activate();

    function activate() {
      console.log('[WatchlistController] activate')
      vm.stocks = [];
      vm.total = 0;
      vm.currentPage = 1;
      vm.pageSize = 50;
      vm.isEdit = false;
      vm.pagingCallback = {};
      vm.newStock = {};
      vm.order = 'code';
      vm.filter = {};
      vm.showAddWatchlistModal = false;
      vm.currentStockList = null;
      vm.watchlistModalAction = 'new';
      vm.stockListOptions = {};

      vm.pagingCallback.goBack = goBack;
      vm.pagingCallback.goNext = goNext;

      vm.filterWatchlist = filterWatchlist;
      vm.addStock = addStock;
      vm.deleteStock = deleteStock;
      vm.addToScreener = addToScreener;
      vm.addToDatabank = addToDatabank;
      vm.reorder = reorder;
      vm.onChangeList = onChangeList;
      vm.addWatchlist = addWatchlist;
      vm.updateWatchlist = updateWatchlist;
      vm.removeWatchlist = removeWatchlist;
      vm.onNewWatchlist = onNewWatchlist;
      vm.buy = buy;
    
      // getWatchlist();

      Broadcast.on('BODY_CLICKED', ()=>{
        _.each(vm.stocks, stock=>stock.showAction = false);
      })
    }
    
    function getWatchlist(search) {
      let query = {
        page_size: vm.pageSize,
        page: vm.currentPage,
        stock_list: vm.filter.stock_list
      }
      if (search) {
        query.search = search;
      }
      if(vm.order) {
        query.ordering = vm.order;
      }
      Watchlist.getAll(query)
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
      return stocks;
    }

    function goBack() {
      vm.currentPage--;
      getWatchlist();
    }

    function goNext() {
      vm.currentPage++;
      getWatchlist();
    }
    
    function filterWatchlist(filter) {
      vm.currentPage = 1;
      getWatchlist(filter);
    }

    function addStock(newStock) {
      if(!newStock.stock) return;
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
      Watchlist.create(data)
        .then(({data})=>{
          data.new = true;
          _.each(vm.stocks, stock=>stock.new = false)
          vm.stocks.unshift(data);
          if(vm.total>vm.pageSize) {
            vm.stocks.pop();
          }
          syncInfo(data);
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

    function deleteStock(stock) {
      ConfirmService.show()
        .then(()=>{
          Watchlist.remove(stock.id)
            .then(()=>{
              _.remove(vm.stocks, (s)=>{
                return s.code === stock.code;
              })
              vm.total--;
              ToastService.success({
                title: 'Delete stock success',
                body: 'The stock has been deleted from your watchlist'
              })
            })
            .catch(({data})=>{
              let msg = 'Failed to add the stock to your watchlist';
              ToastService.danger({
                title: 'Add stock failed',
                body: msg
              })
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
      getWatchlist();
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
          return Watchlist.partialUpdate(stock.id, stock)
        })
        .finally(()=>{
          stock.syncing = false;
        })
      
    }
    function onChangeList(newList) {
      vm.currentStockList = newList
      if(newList) {
        getWatchlist()
      }
    }

    function addWatchlist() {
      vm.watchlistModalAction = 'new';
      vm.showAddWatchlistModal = true;
    }
    function updateWatchlist() {
      vm.watchlistModalAction = 'update';
      vm.showAddWatchlistModal = true;
    }
    function removeWatchlist() {
      ConfirmService.show({
        content: `Do you want to delete Watchlist ${vm.currentStockList.name}`
      })
        .then(()=>{
          StockList.remove(vm.currentStockList.id)
            .then(()=>{
              ToastService.success({
                title: 'Delete Watchlist',
                body: 'Your watchlist has been deleted'
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

    function onNewWatchlist(data) {
      console.log("onNewWatchlist:", data)
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
