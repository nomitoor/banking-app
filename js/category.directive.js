(function () {
  'use strict';

  angular
    .module('fm')
    .directive('fmCategory', fmCategory);

  fmCategory.$inject = ['$timeout', 'ApiService', 'ConfirmService'];
  function fmCategory($timeout, ApiService, ConfirmService) {
    return {
      restrict: 'E',
      templateUrl: 'views/fm-category.html',
      scope: {
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
          console.log('[fmCategory] activate')
          vm.rowEditing = false;
          vm.category = $scope.category;
          vm.deleteItem = deleteItem;
          vm.addItem = addItem;
          vm.calculateNet = calculateNet;
          vm.deleteCategory = deleteCategory;
          vm.monthlyNetKeyPress = monthlyNetKeyPress;
          vm.calculateTotal = calculateTotal;
          vm.saveCategory = saveCategory;
          vm.saveItem = saveItem;
          vm.setZero = setZero;
          vm.addCategory = addCategory;
          vm.itemMoveUp = itemMoveUp;
          vm.itemMoveDown = itemMoveDown;

          if(vm.category.c_type == 2) {
            $scope.$on('EXPENSE_REFRESH', () => {
              calculateTotal();
              calcExpensePercentage();
            })
            calcExpensePercentage();
            if($scope.callback && $scope.callback.categoryReady) {
              $scope.callback.categoryReady.call(null); 
            }
          }

          $scope.$watch('category', (n,o)=>{
            if(n&&o) {
              vm.category = n;
            }
          })
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
                ApiService.deleteItem(item.id)
                  .then(()=>{
                    console.log('[category.directive] deleteCategory then');
                  })
              }
            })
        }

        function addItem() {
          vm.category.items.push({
            id: `i_${Math.random()}`,
            name: '',
            category: vm.category.id,
            editing: true
          })
          vm.rowEditing = true;
        }

        function calculateNet(item) {
          item.bi_weekly = _.round(item.monthly/2, 2)
          item.weekly = _.round(item.monthly/4, 2)
          item.yearly = _.round(item.monthly*12, 2)
          calculateTotal()
        }

        function deleteCategory(category) {
          ConfirmService.show()
            .then(()=>{
              if($scope.callback && $scope.callback.deleteCategory) {
                $scope.callback.deleteCategory.call(null, vm.category);
              }
              if(typeof category.id=='number') {
                ApiService.deleteCategory(category.id)
                  .then(()=>{
                    console.log('[category.directive] deleteCategory then');
                  })
              }
            })
        }
        //not use for now
        function monthlyNetKeyPress($event) {
          if($event.code!=13) {
            return true;
          }

        }
        function calculateTotal() {
          vm.category.total_weekly = 0
          vm.category.total_bi_weekly = 0
          vm.category.total_monthly = 0
          vm.category.total_yearly = 0
          _.each(vm.category.items, (item, i) => {
            vm.category.total_weekly += item.weekly  
            vm.category.total_bi_weekly += item.bi_weekly
            vm.category.total_monthly += item.monthly
            vm.category.total_yearly +=  item.yearly
          })
        }

        function saveCategory(category) {
          if(!category.name ||category.name=='') return;

          category.editing = false;
          let api = null;

          if(typeof category.id =='string' && category.id.indexOf('c_')>=0) { //new
            api = ApiService.createCategory({
              id: undefined, 
              ...category
            })
          }else {
            api = ApiService.updateCategory(category.id, category);
          }

          api.then(({data})=> {
            console.log('[category.directive] saveCategory then')
            category.id = data.id;
            category.c_type = data.c_type;
            if(!category.items.length) {
              addItem();
            }
            if(!category.persistent && $scope.callback && $scope.callback.saveCategory) {
              $scope.callback.saveCategory.call(null, category);
            }
          })

        }

        function saveItem(item) {
          if(!item.name ||item.name==''|| typeof item.monthly=="undefined") return;
          let api = null;
          item.monthly = _.round(item.monthly, 2);
          if(typeof item.id =='string' && item.id.indexOf('i_')>=0) { //new
            api = ApiService.createItem({
              id: undefined, 
              ...item
            })
          }else {
            api = ApiService.updateItem(item.id, item);
          }
          item.editing = false;
          vm.rowEditing = false;
          api.then(({data})=>{
            console.log('[category.directive] saveItem then')
            item.id = data.id
            
            $timeout(()=>{
              if($scope.callback && $scope.callback.saveItem) {
                $scope.callback.saveItem.call(null, item, vm.category);
              } 
              if(vm.category.c_type==2) {
                calcExpensePercentage();
              }
            },50)

          })
          
        }

        function calcExpensePercentage() {
          _.each(vm.category.items,(item, i) => {
            item.percentage = _.round(100*(item.monthly / vm.category.total_monthly), 2)
          })
        }

        function setZero(item) {
          item.zero = !item.zero;
          if(item.zero) {
            item.monthly_bak = item.monthly;
            item.monthly = 0;
          }else {
            item.monthly = item.monthly_bak;
          }
          calculateNet(item);
          $timeout(()=>{
            if($scope.callback && $scope.callback.saveItem) {
              $scope.callback.saveItem.call(null, item, vm.category);
            } 
            if(vm.category.c_type==2) {
              calcExpensePercentage();
            }
          },50)
        }

        function addCategory(category) {
          if($scope.callback.addCategory) {
            $scope.callback.addCategory(category);
          }
        }
        function itemMoveDown(item) {
          const index = _.findIndex(vm.category.items,(i=>i.id==item.id))
          if(index<0)return;
          if(index>=vm.category.items.length-1) return;
          //move 
          const tmp = vm.category.items[index]
          vm.category.items[index]=vm.category.items[index+1]
          vm.category.items[index+1] = tmp

          ApiService.itemDown(item.id)
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
          ApiService.itemUp(item.id)
            .then(()=>{
              console.log('Item moved up')
            })
        }
        
      }]
    }
  }
})();