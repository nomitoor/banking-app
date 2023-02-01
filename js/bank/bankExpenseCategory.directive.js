(function () {
  'use strict';

  angular
    .module('fm')
    .directive('fmExpenseCategory', fmExpenseCategory);

  fmExpenseCategory.$inject = ['$timeout', 'ApiService', 'ConfirmService', 'BankService'];
  function fmExpenseCategory($timeout, ApiService, ConfirmService, BankService) {
    return {
      restrict: 'E',
      templateUrl: 'views/bank/category.html',
      scope: {
        bank: "=",
        category: "=",
        callback: "="
      },
      link: (scope, element, attrs) => {   
        
      },
      controllerAs: 'vm',
      controller: ['$scope', function($scope) { 
        let vm = this;

        activate()
        function activate() {
          console.log('[bankExpenseCategory.directive] activate')
          vm.bank = $scope.bank;
          vm.category = $scope.category;
          // vm.themBgColor = {'background-color': vm.bank.color}

          vm.totalExpense = 0
          
          vm.deleteExpenseItem = deleteExpenseItem;
          vm.addExpenseItem = addExpenseItem;
          vm.calculateTotal = calculateTotal;
          vm.saveExpenseItem = saveExpenseItem;

          vm.setZero = setZero;
          vm.itemMoveUp = itemMoveUp;
          vm.itemMoveDown = itemMoveDown;
          vm.canMove = canMove;

          vm.doSaveCategory = doSaveCategory
          vm.doDeleteCategory = doDeleteCategory
          if($scope.callback && $scope.callback.ready) {
            $scope.callback.ready.call(null); 
          }
          vm.datePickerOptions = {
            initDate: new Date(),
            showWeeks: false,

          }
          calculateTotal();
        }
        function deleteExpenseItem(item) {
          ConfirmService.show()
            .then(()=>{
              _.remove(vm.category.items, ['id', item.id])
              calculateTotal()
              if($scope.callback && $scope.callback.deleteExpenseItem) {
                $scope.callback.deleteExpenseItem.call(null, item);
              }
              if(typeof item.id == 'number') {
                BankService.deleteExpenseItem(item.id)
                  .then(()=>{
                    console.log('[Bank.directive] deleteExpenseItem then');
                  })
              }
            })
        }

        function addExpenseItem() {
          vm.category.items.push({
            id: `ei_${Math.random()}`,
            name: ' ',
            date: new Date(),
            amount: 0,
            category: vm.category.id,
            editing: true
          })
        }

        function calculateTotal() {
          vm.totalExpense = _.sumBy(vm.category.items, 'amount')
        }

        function saveExpenseItem(item) {
          if(!item.name ||item.name==''|| !item.amount||!item.date) return;
          let api = null;
          item.amount = _.round(item.amount, 2);
          if (item.amount > 0) {
            item.amount = -item.amount
          }
          if (item.date) {
            item.date = moment(item.date).format('YYYY-MM-DD')
          }
          if(typeof item.id =='string' && item.id.indexOf('ei_')>=0) { //new
            api = BankService.createExpenseItem({
              ...item,
              id: undefined
            })
          }else {
            api = BankService.updateExpenseItem(item.id, item);
          }
          item.editing = false;
          api.then(({data})=>{
            console.log('[BankExpenseCategory.directive] saveExpenseItem then')
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
          const index = _.findIndex(vm.category.items,(i=>i.id==item.id))
          if(index<0)return;
          if(index>=vm.category.items.length-1) return;
          //move 
          const tmp = vm.category.items[index]
          vm.category.items[index]=vm.category.items[index+1]
          vm.category.items[index+1] = tmp

          BankService.expenseItemDown(item.id)
            .then(()=>{
              console.log('Item moved down')
            })
        }

        function itemMoveUp(item) {
          const index = _.findIndex(vm.category.items,(i=>i.id==item.id))
          if(index<=0)return;
          if(index>vm.category.items.length-1) return;
          //move 
          const tmp = vm.category.items[index]
          vm.category.items[index]=vm.category.items[index-1]
          vm.category.items[index-1] = tmp
          BankService.expenseItemUp(item.id)
            .then(()=>{
              console.log('Item moved up')
            })
        }
        
        function canMove(item) {
          return typeof item.id === 'number'
        }

        function doSaveCategory(category) {
          if(!category.name || category.name=='') return;
          let api = null;
          if(typeof category.id =='string' && category.id.indexOf('ec_')>=0) { //new
            api = BankService.createExpenseCategory({
              ...category,
              id: undefined
            })
          }else {
            api = BankService.updateExpenseCategory(category.id, category);
          }
          
          category.editing = false;
          
          api.then(({data})=>{
            console.log('[Bank.directive] doSaveCategory then')
            category.id = data.id
          })
        }

        function doDeleteCategory(category) {
          ConfirmService.show()
            .then(()=>{
              if($scope.callback && $scope.callback.deleteExpenseCategory) {
                $scope.callback.deleteExpenseCategory.call(null, category);
              }
            })
        }

      }]
    }
  }
})();