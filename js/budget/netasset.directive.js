(function () {
  'use strict';

  angular
    .module('fm')
    .directive('netAsset', netAsset);

  netAsset.$inject = ['$timeout', 'ApiService', 'ConfirmService'];
  function netAsset($timeout, ApiService, ConfirmService) {
    return {
      restrict: 'E',
      templateUrl: 'views/budget/netasset.html',
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
          console.log('[NetAsset.directive] activate')
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
                ApiService.deleteNetAsset(item.id)
                  .then(()=>{
                    console.log('[NetAsset.directive] deleteCategory then');
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
          if($scope.callback && $scope.callback.onTotalChange) {
            $scope.callback.onTotalChange.call(null, vm.total_yearly); 
          }
        }

        function saveItem(item) {
          if(!item.name ||item.name==''|| typeof item.yearly=="undefined") return;
          let api = null;
          item.yearly = _.round(item.yearly, 2);
          if(typeof item.id =='string' && item.id.indexOf('i_')>=0) { //new
            api = ApiService.createNetAsset({
              id: undefined, 
              budget: vm.budgetId,
              ...item
            })
          }else {
            api = ApiService.updateNetAsset(item.id, item);
          }
          item.editing = false;
          vm.rowEditing = false;
          api.then(({data})=>{
            console.log('[NetAsset.directive] saveItem then')
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

          ApiService.netAssetDown(item.id)
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
          ApiService.netAssetUp(item.id)
            .then(()=>{
              console.log('Item moved up')
            })
        }
        
      }]
    }
  }
})();