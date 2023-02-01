(function () {
  'use strict';

  angular
    .module('fm')
    .directive('fmBank', BankDirective);

  BankDirective.$inject = ['$timeout', 'ApiService', 'ConfirmService', 'BankService'];
  function BankDirective($timeout, ApiService, ConfirmService, BankService) {
    return {
      restrict: 'E',
      templateUrl: 'views/bank/bank.html',
      scope: {
        bank: "=",
        callback: "="
      },
      link: (scope, element, attrs) => {   
        
      },
      controllerAs: 'vm',
      controller: ['$scope', function($scope) { 
        let vm = this;

        activate()
        function activate() {
          console.log('[bank.directive] activate')
          vm.bank = $scope.bank;
          
          vm.totalIncome = 0
          vm.totalExpense = 0
          vm.incomeVsExpense = 0

          vm.deleteIncomeItem = deleteIncomeItem;
          vm.addIncomeItem = addIncomeItem;
          vm.calculateTotal = calculateTotal;
          vm.saveIncomeItem = saveIncomeItem;

          vm.setZero = setZero;
          vm.itemMoveUp = itemMoveUp;
          vm.itemMoveDown = itemMoveDown;
          vm.canMove = canMove;

          vm.doSaveBank = doSaveBank
          vm.doDeleteBank = doDeleteBank

          vm.addCategory = addCategory
          
          vm.categoryCallback = {
            deleteExpenseCategory
          }

          if($scope.callback && $scope.callback.ready) {
            $scope.callback.ready.call(null); 
          }
          calculateTotal();
        }
        function deleteIncomeItem(item) {
          ConfirmService.show()
            .then(()=>{
              _.remove(vm.bank.income_items, ['id', item.id])
              calculateTotal()
              if($scope.callback && $scope.callback.deleteIncomeItem) {
                $scope.callback.deleteIncomeItem.call(null, item);
              }
              if(typeof item.id == 'number') {
                BankService.deleteIncomeItem(item.id)
                  .then(()=>{
                    console.log('[Bank.directive] deleteIncomeItem then');
                  })
              }
            })
        }

        function addIncomeItem() {
          vm.bank.income_items.push({
            id: `i_${Math.random()}`,
            name: ' ',
            amount: 0,
            bank: vm.bank.id,
            editing: true
          })
        }

        function calculateTotal() {
          vm.totalIncome = _.sumBy(vm.bank.income_items, 'amount')
          vm.totalExpense = 0
          vm.incomeVsExpense = vm.totalIncome - vm.totalExpense
          if($scope.callback && $scope.callback.onTotalChange) {
            $scope.callback.onTotalChange.call(null); 
          }
        }

        function saveIncomeItem(item) {
          if(!item.name ||item.name==''|| typeof item.amount=="undefined") return;
          let api = null;
          item.amount = _.round(item.amount, 2);
          if(typeof item.id =='string' && item.id.indexOf('i_')>=0) { //new
            api = BankService.createIncomeItem({
              ...item,
              id: undefined
            })
          }else {
            api = BankService.updateIncomeItem(item.id, item);
          }
          item.editing = false;
          api.then(({data})=>{
            console.log('[Bank.directive] saveIncomeItem then')
            item.id = data.id
            calculateTotal()
          })
          
        }

        function setZero(item) {
          item.zero = !item.zero;
          if(item.zero) {
            item.amount_bak = item.amount;
            item.amount = 0;
          }else {
            item.amount = item.amount_bak;
          }
          calculateTotal()
        }

        function itemMoveDown(item) {
          const index = _.findIndex(vm.bank.income_items,(i=>i.id==item.id))
          if(index<0)return;
          if(index>=vm.bank.income_items.length-1) return;
          //move 
          const tmp = vm.bank.income_items[index]
          vm.bank.income_items[index]=vm.bank.income_items[index+1]
          vm.bank.income_items[index+1] = tmp

          BankService.incomeItemDown(item.id)
            .then(()=>{
              console.log('Item moved down')
            })
        }

        function itemMoveUp(item) {
          const index = _.findIndex(vm.bank.income_items,(i=>i.id==item.id))
          if(index<=0)return;
          if(index>vm.bank.income_items.length-1) return;
          //move 
          const tmp = vm.bank.income_items[index]
          vm.bank.income_items[index]=vm.bank.income_items[index-1]
          vm.bank.income_items[index-1] = tmp
          BankService.incomeItemUp(item.id)
            .then(()=>{
              console.log('Item moved up')
            })
        }
        
        function canMove(item) {
          return typeof item.id === 'number'
        }

        function doSaveBank(bank) {
          if(!bank.name || bank.name=='') return;
          let api = null;
          let isNew = (typeof bank.id =='string' && bank.id.indexOf('b_')>=0)

          if(isNew) { //new
            api = BankService.createBank({
              name: bank.name
            })
          }else {
            api = BankService.updateBank(bank.id, bank);
          }
          
          bank.editing = false;
          
          api
          .then(({data})=>{
            console.log('[Bank.directive] doSaveBank then')
            bank.id = data.id
            return bank.id
          })
          .then((bankId) => {
            if(isNew) {
              BankService.getBank(bankId)
                .then(({data}) => {
                  bank.expense_categories = data.expense_categories
                })
            }
          })
        }
        function doDeleteBank(bank) {
          ConfirmService.show()
            .then(()=>{
              if($scope.callback && $scope.callback.deleteBank) {
                $scope.callback.deleteBank.call(null, bank);
              }
            })
        }
        function addCategory() {
          vm.bank.expense_categories.push({
            id: `ec_${Math.random()}`,
            name: ' ',
            bank: vm.bank.id,
            items: [],
            editing: true
          })
        }

        function deleteExpenseCategory(category) {
          _.remove(vm.bank.expense_categories, ['id', category.id])
          if(typeof category.id == 'number') {
            BankService.deleteExpenseCategory(category.id)
              .then(()=>{
                console.log('[Bank.directive] deleteExpenseCategory then');
              })
          }
        }

      }]
    }
  }
})();