(function () {
  'use strict';

  angular.module("fm")
    .controller("ForgotController", ForgotController)
  
  ForgotController.$inject = ['$scope', '$rootScope', '$timeout', '$location', 'ApiService'];
  function ForgotController($scope, $rootScope, $timeout, $location, ApiService){
    let vm = this;
    
    activate();

    function activate() {
      vm.forgotSuccess = false;
      vm.forgot = forgot;
      vm.isWaiting = false;
      vm.errorText = '';
    }

    function forgot(user) {
      vm.forgotSuccess = false;
      vm.isWaiting = true;
      vm.errorText = '';
      ApiService.forgot(user)
        .then(function(data) {
          vm.forgotSuccess = true;
        })
        .catch(({data})=>{
          //show error
          if (data.detail) {
            vm.errorText = data.detail;
          }else {
            _.each(data,(err)=>{
              vm.errorText = err[0];
              return false;
            })
          }
        })
        .finally(()=>{
          vm.isWaiting = false;
        })
    }
    
  }
})();
