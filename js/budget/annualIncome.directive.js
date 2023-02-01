(function () {
  'use strict';

  angular
    .module('fm')
    .directive('annualIncome', annualIncome);

  annualIncome.$inject = ['$timeout', 'ApiService', 'ConfirmService'];
  function annualIncome($timeout, ApiService, ConfirmService) {
    return {
      restrict: 'E',
      templateUrl: 'views/budget/annualIncome.html',
      scope: {
        items: "=",
        budgetId: "@",
        callback: "="
      },
      link: (scope, element, attrs) => {   
        
      },
      controllerAs: 'vm',
      controller: ['$scope', function($scope) { 
        let vm = this;

        activate()
        function activate() {
          console.log('[annualIncome] activate')
          vm.currentYear = new Date().getFullYear()

          vm.rowEditing = false;
          vm.items = $scope.items;
          vm.budgetId = parseInt($scope.budgetId);

          vm.deleteItem = deleteItem;
          vm.addItem = addItem;
          vm.calculateTotal = calculateTotal;
          vm.saveItem = saveItem;
          vm.setZero = setZero;
          vm.itemMoveUp = itemMoveUp;
          vm.itemMoveDown = itemMoveDown;

          if($scope.callback && $scope.callback.ready) {
            $scope.callback.ready.call(null); 
          }
          calculateTotal();
        }
        function deleteItem(item) {
          ConfirmService.show()
            .then(()=>{
              _.remove(vm.items, ['id', item.id])
              calculateTotal()
              if($scope.callback && $scope.callback.deleteItem) {
                $scope.callback.deleteItem.call(null, item, vm.items);
              }
              if(typeof item.id == 'number') {
                ApiService.deleteAnnualIncome(item.id)
                  .then(()=>{
                    console.log('[annualIncome.directive] deleteCategory then');
                  })
              }
            })
        }

        function addItem() {
          vm.items.push({
            id: `i_${Math.random()}`,
            name: '',
            budget: vm.budgetId,
            editing: true
          })
          vm.rowEditing = true;
        }

        function calculateTotal() {
          vm.total_yearly = _.sumBy(vm.items, 'yearly')
        }

        function saveItem(item) {
          if(!item.name ||item.name==''|| typeof item.yearly=="undefined") return;
          let api = null;
          item.yearly = _.round(item.yearly, 2);
          if(typeof item.id =='string' && item.id.indexOf('i_')>=0) { //new
            api = ApiService.createAnnualIncome({
              id: undefined, 
              budget: vm.budgetId,
              ...item
            })
          }else {
            api = ApiService.updateAnnualIncome(item.id, item);
          }
          item.editing = false;
          vm.rowEditing = false;
          api.then(({data})=>{
            console.log('[annualIncome.directive] saveItem then')
            item.id = data.id
            calculateTotal()
          })
          
        }

        function setZero(item) {
          item.zero = !item.zero;
          if(item.zero) {
            item.yearly_bak = item.yearly;
            item.yearly = 0;
          }else {
            item.yearly = item.yearly_bak;
          }
        }

        function itemMoveDown(item) {
          const index = _.findIndex(vm.items,(i=>i.id==item.id))
          if(index<0)return;
          if(index>=vm.items.length-1) return;
          //move 
          const tmp = vm.items[index]
          vm.items[index]=vm.items[index+1]
          vm.items[index+1] = tmp

          ApiService.annualIncomeDown(item.id)
            .then(()=>{
              console.log('Item moved down')
            })
        }

        function itemMoveUp(item) {
          const index = _.findIndex(vm.items,(i=>i.id==item.id))
          if(index<=0)return;
          if(index>vm.items.length-1) return;
          //move 
          const tmp = vm.items[index]
          vm.items[index]=vm.items[index-1]
          vm.items[index-1] = tmp
          ApiService.annualIncomeUp(item.id)
            .then(()=>{
              console.log('Item moved up')
            })
        }
        
      }]
    }
  }
})();