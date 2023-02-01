(function () {
  'use strict';

  angular
    .module('fm')
    .directive('debtCategory', debtCategory);

  debtCategory.$inject = ['$timeout', 'ApiService', 'DebtApi','ConfirmService'];
  function debtCategory($timeout, ApiService, DebtApi, ConfirmService) {
    return {
      restrict: 'E',
      templateUrl: 'views/debt-category.html',
      scope: {
        category: "=",
        callback: "=",
        cType: '@'
      },
      link: (scope, element, attrs) => {   
        
      },
      controllerAs: 'vm',
      controller: ['$scope', function($scope) { 
        let vm = this;

        activate()
        function activate() {
          console.log('[debtCategory] activate')

          vm.category = $scope.category;
          vm.cType = $scope.cType || '';
          
          vm.deleteItem = deleteItem;
          vm.addItem = addItem;
          vm.deleteCategory = deleteCategory;
          vm.calculateTotal = calculateTotal;
          vm.saveCategory = saveCategory;
          vm.saveItem = saveItem;
        }

        function deleteItem(item) {
          ConfirmService.show()
            .then(()=>{
              _.remove(vm.category.items, ['id', item.id])
          
              calculateTotal()
              
              if($scope.callback && $scope.callback.deleteItem) {
                $scope.callback.deleteItem.call(null, item, vm.category);
              }

              if(typeof item.id == 'number') {
                let api = null;
                if (vm.cType==='liability') {
                  api = DebtApi.deleteLiabilityItem(item.id)
                }else{
                  api = DebtApi.deleteItem(item.id)
                }

                api.then(()=>{
                  console.log('[debtCategory.directive] deleteItem then');
                })
              }
            })
        }

        function addItem() {
          vm.category.items.push({
            id: `i_${Math.random()}`,
            name: '',
            category: vm.category.id,
            liability: vm.category.id,
            editing: true
          })
        }

        function deleteCategory(category) {
          if(category.persistent) return;
          ConfirmService.show()
            .then(()=>{
              if($scope.callback && $scope.callback.deleteCategory) {
                $scope.callback.deleteCategory.call(null, vm.category);
              }
              if(typeof category.id=='number') {
                DebtApi.deleteCategory(category.id)
                  .then(()=>{
                    console.log('[debtCategory.directive] deleteCategory then');
                  })
              }
          })
        }
        
        function calculateTotal() {
          vm.category.total = _.sumBy(vm.category.items, 'amount')
        }

        function saveCategory(category) {
          if(!category.name ||category.name=='') return;

          category.editing = false;
          
          let api = null;

          if(typeof category.id =='string' && category.id.indexOf('c_')>=0) { //new
            if(vm.cType==='liability') {
              api = DebtApi.createLiability({id:undefined,...category});
            }else{
              api = DebtApi.createCategory({
                id: undefined, 
                ...category
              })
            }
          }else {
            if(vm.cType==='liability') {
              api = DebtApi.updateLiability(category.id, category);
            }else {
              api = DebtApi.updateCategory(category.id, category);
            }
          }

          api.then(({data})=> {
            console.log('[debtCategory.directive] saveCategory then')
            category.id = data.id
            if(!category.items.length) {
              addItem();
            }
            if(!category.persistent && $scope.callback && $scope.callback.saveCategory) {
              $scope.callback.saveCategory.call(null, category);
            }
          })

        }

        function saveItem(item) {
          if(!item.name ||item.name==''|| typeof item.amount=="undefined") return;
          item.amount = _.round(item.amount, 2);
          let api = null;
          
          if(typeof item.id =='string' && item.id.indexOf('i_')>=0) { //new
            if(vm.cType==='liability') {
              api = DebtApi.createLiabilityItem({
                id: undefined, 
                ...item
              })
            }else {
              api = DebtApi.createItem({
                id: undefined, 
                ...item
              })
            }
          }else {
            if(vm.cType==='liability') {
              api = DebtApi.updateLiabilityItem(item.id, item);
            }else{
              api = DebtApi.updateItem(item.id, item);
            }
          }
          item.editing = false;
          api.then(({data})=>{
            console.log('[debtCategory.directive] saveItem then')
            item.id = data.id
            
            if($scope.callback && $scope.callback.saveItem) {
              $scope.callback.saveItem.call(null, item, vm.category);
            } 
            
          }) 
        }
        
      }]
    }
  }
})();