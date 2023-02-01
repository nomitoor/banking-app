(function () {
  'use strict';

  angular.module("fm")
    .controller("LoginController", LoginController)
  
  LoginController.$inject = ['$scope', '$rootScope', '$timeout', '$location', 'ApiService'];

  function LoginController($scope, $rootScope, $timeout, $location, ApiService){
    let vm = this;
    
    activate();

    function activate() {
      vm.loginError = false;
      vm.login = login;
      
    }

    function login(username, password) {
      vm.loginError = false;
      ApiService.login(username, password)
        .then(() =>{
          return ApiService.getProfile()
        })
        .then(()=> {
          $location.path('/routing')
        })
        .catch(()=>{
          //show error
          vm.loginError = true;
        })
    }
    
  }
})();
