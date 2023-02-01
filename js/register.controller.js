(function () {
  'use strict';

  angular.module("fm")
    .controller("RegisterController", RegisterController)
  
  RegisterController.$inject = ['$scope', '$rootScope', '$timeout', '$location', 'ApiService'];

  function RegisterController($scope, $rootScope, $timeout, $location, ApiService){
    let vm = this;
    
    activate();

    function activate() {
      vm.registerError = false;
      vm.registerSuccess = false;
      vm.errorText = '';
      vm.isWaiting = false;
      vm.register = register;
      vm.GENDERS = [{
        label: 'Male',
        value: 1
      }, {
        label: 'Female',
        value: 2
       },{
        label: 'Other',
        value: 3
      }]
    }

    function register(user) {
      vm.registerError = false;
      vm.isWaiting = true;
      
      ApiService.register(user)
        .then(function(data) {
          vm.registerSuccess = true;
          $timeout(()=>{
            $location.path('/login')
          },5000)
          
        })
        .catch(({data})=>{
          //show error
          vm.registerError = true;
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
