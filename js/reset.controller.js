(function () {
  'use strict';

  angular.module("fm")
    .controller("ResetController", ResetController)
  
  ResetController.$inject = ['$scope', '$routeParams', '$timeout', '$location', 'ApiService'];

  function ResetController($scope, $routeParams, $timeout, $location, ApiService){
    let vm = this;
    
    activate();

    function activate() {
      vm.resetStatus = 0;
      vm.errorText = '';
      vm.reset = reset;
      vm.user = {
        uid: $routeParams.uid,
        token: $routeParams.token
      }
      
    }

    function reset(user) {
      if(!vm.resetForm.$valid || vm.user.new_password!=vm.user.retype_password) {
        return;
      }
      vm.errorText  = '';
      vm.resetStatus = 0;
      ApiService.reset(user)
        .then(function(data) {
          vm.resetStatus = 1;
          $timeout(()=>{
            $location.path('/login');
          }, 5000);
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
    }
    
  }
})();
