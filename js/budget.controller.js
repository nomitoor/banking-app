(function () {
  'use strict';

  angular.module("fm")
  .controller("BudgetController", BudgetController);
  BudgetController.$inject = ['$scope', '$rootScope', '$location', '$timeout', 'ApiService', 'PermissionService'];
  
  function BudgetController($scope, $rootScope, $location, $timeout, ApiService, PermissionService){
    let vm = this;
    
    PermissionService.is_permit('budget') && activate();

    function activate() {
      console.log('[BudgetController] activate')
      
      vm.budgets = [];
      vm.budgetCallback = {};

      vm.budgetCallback.deleteBudget = onDeleteBudget;
      vm.budgetCallback.addBudget = onAddBudget;
      
      getBudgets();
    }

    function getBudgets() {
      ApiService.getBudgets()
        .then( ({results}) => {
          vm.budgets = results;
        })
        .catch((e)=>{
          if(e.status===401) {
            $location.path('/login');
          }
        })
    }

    
    function onDeleteBudget(budget) {
      console.log('onDeleteBudget:', budget.id);
      let index = _.findIndex(vm.budgets, ['id', budget.id]);
      if (index>=0) {
        $timeout(()=>{
          vm.budgets.splice(index, 1);
        })
      }
    }

    function onAddBudget(budget, nextTo) {
      let index = _.findIndex(vm.budgets, (b)=>{
        return b.id==nextTo;
      })
      $timeout(()=>{
        console.log(vm.budgets);
        if (index<0) {
          vm.budgets.push(budget)
        }else {
          vm.budgets.splice(index + 1, 0, budget);
        }
        $scope.$apply();
        console.log(vm.budgets);
      });
    }
  }
})();
