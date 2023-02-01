angular.module('fm')
  .factory('SellStockService', ['$rootScope', '$q', function($rootScope, $q) {
    var vm = this;
    
    function show(stockInfo, portfolio) {
      console.log('[SellStockService] show()');
      vm.defer=$q.defer();	
      $rootScope.$broadcast('SELL_STOCK_SHOW', stockInfo, portfolio)
      return vm.defer.promise;
    }
    $rootScope.$on("SELL_STOCK_CONFIRM", (e)=>{
      vm.defer.resolve();
    })
    
    return {
      show
    }

  }]);