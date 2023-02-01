(function () {
  'use strict';

  angular.module("fm")
    .controller("BankController", BankController);

  BankController.$inject = ['$scope', '$rootScope', '$timeout', '$filter', 'PermissionService', 'ApiService', 'BankService'];

  function BankController($scope, $rootScope, $timeout, $filter, PermissionService, ApiService, BankService){
    let vm = this;
    
    PermissionService.is_permit('bank') && activate();

    function activate() {
      console.log('[BankController] activate')
      vm.banks = []
      vm.bankCallback = {
        deleteBank
      }
      vm.addBank = addBank
      getBanks()
    }

    function getBanks() {
      BankService.getBanks()
        .then(({data}) => {
          vm.banks = data.results;
        })
    }
    function deleteBank(bank) {
      _.remove(vm.banks, ['id', bank.id])
      if(typeof bank.id == 'number') {
        BankService.deleteBank(bank.id)
          .then(()=>{
            console.log('[Bank.controller] deleteBank then');
          })
      }
    }
    function addBank() {
      vm.banks.push({
        id: `b_${Math.random()}`,
        name: '',
        color: '#2962ff',
        income_items: [],
        editing: true
      })
    }
  }
})();
