(function () {
  'use strict';

  angular.module("fm")
    .controller("ActivateController", ActivateController)
  
  ActivateController.$inject = ['$scope', '$routeParams', '$timeout', '$location', 'ApiService'];

  function ActivateController($scope, $routeParams, $timeout, $location, ApiService){
    let vm = this;
    
    activate();

    function activate() {
      vm.activateStatus = 0;
      vm.activate = activate;
     
      let data = {
        uid: $routeParams.uid,
        token: $routeParams.token
      }
      userActivate(data);
    }

    function userActivate(user) {
      vm.forgotSuccess = false;
      ApiService.activate(user)
        .then(function(data) {
          vm.activateStatus = 1;
          $timeout(()=>{
            $location.path('/login');
          },5000)
        })
        .catch(()=>{
          vm.activateStatus = 2;
        })
    }
    
  }
})();
