angular.module('fm')
  .factory('ConfirmService', ['$rootScope', '$q', function($rootScope, $q) {
    var vm = this;
    
    function show(options) {
      console.log('[ConfirmService] show()');
      vm.defer=$q.defer();	
      $rootScope.$broadcast('CONFIRM_MODAL_SHOW', options||{})
      return vm.defer.promise;
    }
    $rootScope.$on("CONFIRM_MODAL_CONFIRM", (e)=>{
      vm.defer.resolve();
    })
    
    return {
      show
    }

  }]);