angular.module('fm')
  .factory('BuyStockService', ['$rootScope', '$q', function($rootScope, $q) {
    var vm = this;
    
    function show(stockInfo, buyInfo, dividendInfo, currentPortfolio) {
      console.log('[BuyStockService] show()');
      vm.defer=$q.defer();	
      $rootScope.$broadcast('BUY_STOCK_SHOW', stockInfo, buyInfo, dividendInfo, currentPortfolio)
      return vm.defer.promise;
    }
    $rootScope.$on("BUY_STOCK_CONFIRM", (e)=>{
      vm.defer.resolve();
    })
    
    return {
      show
    }

  }]);