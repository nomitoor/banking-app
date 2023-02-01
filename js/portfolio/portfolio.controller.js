(function () {
  'use strict';

  angular.module("fm")
    .controller("PortfolioController", PortfolioController);

  PortfolioController.$inject = ['$scope', '$rootScope', '$timeout', '$filter', 'ApiService', 'StockService',
    'YahooService', 'PermissionService', 'Databank', 'Screener', 'Watchlist', 'Broadcast', 'StockParser', 
    'ToastService', 'ConfirmService', 'StockList', 'BuyStockService', 'Portfolio'];

  function PortfolioController($scope, $rootScope, $timeout, $filter, ApiService, StockService, 
    YahooService, PermissionService, Databank, Screener, Watchlist, Broadcast, StockParser,
    ToastService, ConfirmService, StockList, BuyStockService, Portfolio){
    let vm = this;
    
    PermissionService.is_permit('portfolio') && activate();

    function activate() {
      vm.myPortfolio = {}
      vm.currentPortfolio = null
      vm.portfolioOption = {}
      vm.showModal = false;
      vm.modalType = 'add';

      vm.onChangePortfolio = onChangePortfolio
      vm.showAddBalance = showAddBalance;
      vm.showWithdrawBalance = showWithdrawBalance;
      vm.updateBalance = updateBalance;
      console.log('[PortfolioController] activate')
    }

    function onChangePortfolio(p) {
      vm.currentPortfolio = p;
    }

    function showWithdrawBalance() {
      vm.modalType = 'withdraw'
      vm.showModal = true
    }

    function showAddBalance() {
      vm.modalType = 'add'
      vm.showModal = true
    }

    function updateBalance(amount) {
      let request = null
      if(vm.modalType==='add') {
        request = Portfolio.addBalance
      } else {
        request = Portfolio.withdraw
      }
      request(vm.currentPortfolio.id, {amount})
        .then(res => {
          ToastService.success({
            title: 'Add Balance',
            body: 'Your portfolio has been updated new balance'
          })
          vm.showModal = false;
          if(vm.portfolioOption && vm.portfolioOption.refresh) {
            vm.portfolioOption.refresh()
          }
        })
        .catch(err => {
          console.log(err);
          ToastService.danger({
            title: 'Add Balance',
            body: "Your amount is not valid or you don't have permission on this portfolio"
          })
        })
        
      
    }
  }
})();
