(function () {
  'use strict';

  angular.module("fm")
  .controller("DebtController", DebtController);
  DebtController.$inject = ['$scope', '$rootScope', '$timeout', 'ApiService', 'DebtApi', 'PermissionService'];
  function DebtController($scope, $rootScope, $timeout, ApiService, DebtApi, PermissionService){
    let vm = this;
    
    PermissionService.is_permit('debt') && activate(); 

    function activate() {
      console.log('[debt.controller.js] activate')
      
      vm.debts = [];
      vm.callback = {};

      vm.callback.deleteDebt = onDeleteDebt;
      vm.addDebt = addDebt;
      getDebts();

    }

    function getDebts() {
      DebtApi.getDebts()
        .then( ({results}) => {
          vm.debts = results;
        })
    }
    function addDebt() {
      DebtApi.copyDebt()
        .then(({data})=>{
          console.log('[debt.controller.js] addDebt then')
          if (!data.length) {
            vm.debts.push(data)
          }else{
            _.each(data, (d)=>{
              vm.debts.push(d);
            })
          }
        })

    }
    function onDeleteDebt(debt) {
      _.remove(vm.debts, ['id', debt.id]);
    }

  };

})();
