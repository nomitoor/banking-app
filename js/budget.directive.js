(function () {
  'use strict';

  angular
    .module('fm')
    .directive('fmBudget', fmBudget);

  fmBudget.$inject = ['$timeout', 'ChartService', 'ApiService', 'ConfirmService'];
  function fmBudget($timeout, ChartService, ApiService, ConfirmService) {
    return {
      restrict: 'E',
      templateUrl: 'views/fm-budget.html',
      scope: {
        budget: "=",
        callback: "="
      },
      link: (scope, element, attrs) => {   
        
      },
      controllerAs: 'vm',
      controller: ['$scope', function($scope) { 
        let vm = this;

        activate()
        function activate() {
          console.log('[fmBudget] activate')
          vm.budget = $scope.budget;
          vm.assetPerLiability = 0;
          vm.categoryCallback = {};
          vm.netAssetCallback = {
            onTotalChange: onNetAssetTotalChange
          };
          vm.liabilityCallback = {
            onTotalChange: onLiabilityTotalChange
          }
          vm.categoryCallback.deleteCategory = onDeleteCategory;
          vm.categoryCallback.saveItem = onSaveItem;
          vm.categoryCallback.deleteItem = onDeleteItem;
          vm.categoryCallback.saveCategory = onSaveCategory;
          vm.categoryCallback.categoryReady = categoryReady;
          vm.categoryCallback.addCategory = addCategory;
          vm.addCategory = addCategory;
          vm.saveBudget = saveBudget;
          vm.deleteBudget = deleteBudget;
          vm.addBudget = addBudget;
          vm.editBudget = editBudget;
          vm.printBudget = printBudget;

          $scope.$watch('budget', (n,o)=>{
            if (n&&o) {
              vm.budget = n;
              $timeout(()=>{
                drawChart();
              },100);
            }
          })
        }
        function categoryReady() {
          if(vm.budget.expense.items.length) {
            $timeout(()=> {
              drawChart();
            },100) 
          }
        }

        function saveBudget(budget) {
          vm.budget.editing = false;
          ApiService.updateBudget(budget.id, budget)
            .then(({data})=>{
              let redraw = false;
              if(vm.budget.pie_title!=budget.pie_title) {
                redraw = true;
              }
              vm.budget.name = data.name;
              vm.budget.pie_title = data.pie_title;
              console.log('[budget.directive.js] saveBudget then')
              if(redraw) drawChart();
            })
        }

        function deleteBudget(budget) {
          vm.budget.editing = false;
          ApiService.deleteBudget(budget.id)
            .then(()=>{
              console.log('[budget.directive.js] deleteBudget then')
              if($scope.callback && $scope.callback.deleteBudget) {
                $scope.callback.deleteBudget(budget)
              }
            })
        }
        function addBudget(budget) {
          ApiService.copyBudget(budget.id)
            .then(({data})=>{
              console.log('[budget.controller.js] addBudget then', data)
              if($scope.callback && $scope.callback.addBudget) {
                $scope.callback.addBudget(data, budget.id)
              }
            })
        }
        function editBudget() {
          vm.budgetEdit = _.clone(vm.budget);
          vm.budget.editing = true;
        }

        function printBudget() {
          let includes = ['css/app.css', 'libs/bootstrap.min.css', 'css/printjs.css']
          if (ENV && ENV=='production') {
            includes = ['/app.min.css', 'css/bootstrap.min.css', 'css/printjs.css']
          }
         
          printJS({
            printable: 'b_' + vm.budget.id,
            type: 'html',
            css: includes,
            maxWidth: '1024px',
            targetStyles: ["*"]
          })
    
        }

        function onDeleteCategory(category) {
          //delete category also delete item in expense
          let index = _.findIndex(vm.budget.expense.items, ['ref_category', category.id])
          if(index>=0) {
            vm.budget.expense.items.splice(index, 1)
          }
          _.remove(vm.budget.categories, ['id', category.id]);
        }
    
        function addCategory(currentCategory) {
          let newCategory = {
            id: `c_${Math.random()}`,
            name: "",
            budget: vm.budget.id,
            editing: true,
            items: []
          }
          if(!currentCategory) {
            newCategory.order = 1;
            vm.budget.categories.unshift(newCategory);
            return;
          }
          newCategory.order = currentCategory.order;
          let index = _.findIndex(vm.budget.categories, ['id', currentCategory.id])
          if(index<0) { //add to last
            vm.budget.categories.push(newCategory);
          }else {
            $timeout(()=>{
              vm.budget.categories.splice(index+1, 0, newCategory);
            })            
          }
        }
        
        function onSaveItem(item, category) {
          updateRefItem(category);
          $timeout(()=>{
            calcSurplus();
            drawChart();
          },20);
          
          $scope.$broadcast('EXPENSE_REFRESH', {});

        }

        function onDeleteItem(item, category) {
          updateRefItem(category);
          $timeout(()=>{
            calcSurplus();
            drawChart();
          },20);
          $scope.$broadcast('EXPENSE_REFRESH', {});
        }
    
        function updateRefItem(category) {
          let index = _.findIndex(vm.budget.expense.items, ['ref_category', category.id])
          if(index<0) return;
          vm.budget.expense.items[index].weekly = category.total_weekly
          vm.budget.expense.items[index].bi_weekly = category.total_bi_weekly
          vm.budget.expense.items[index].monthly = category.total_monthly
          vm.budget.expense.items[index].yearly = category.total_yearly

          let item = _.find(vm.budget.expense.items, ['ref_category', category.id])
          if(item) {
            ApiService.updateItem(item.id, item)
              .then(()=>{
                console.log('[budget.directive.js] updateItem then')
              })
          }
        }
    
        function onSaveCategory(category) {
          let item = _.find(vm.budget.expense.items, ['ref_category', category.id])
          if (item) {
            item.name = category.name;
            return;
          }
          let newExpenseItem = {
            name: category.name,
            ref_category: category.id,
            category: vm.budget.expense.id
          }
          
          ApiService.createItem(newExpenseItem)
            .then(({data})=>{
              newExpenseItem.id = data.id
              vm.budget.expense.items.push(newExpenseItem)
            })
        }
    
        function calcSurplus() {
          vm.budget.surplus_weekly = vm.budget.income.total_weekly - vm.budget.expense.total_weekly
          vm.budget.surplus_bi_weekly = vm.budget.income.total_bi_weekly - vm.budget.expense.total_bi_weekly
          vm.budget.surplus_monthly = vm.budget.income.total_monthly - vm.budget.expense.total_monthly
          vm.budget.surplus_yearly = vm.budget.income.total_yearly - vm.budget.expense.total_yearly
        }

        function numberFormat(num, prefix) {
          let numStr = num.toLocaleString(undefined, {minimumFractionDigits: 2});
          if (prefix) {
            numStr = prefix + numStr
          }
          return numStr;
        }

        function drawChart() {
          let data = [];
          let totalMonthlyNet = (_.sumBy(vm.budget.expense.items, 'monthly')) || 0
          _.each(vm.budget.expense.items, (c, i) => {
            let v = _.round(c.monthly,2)
            let p = _.round(100*c.monthly/totalMonthlyNet,2)
            v = numberFormat(v,'$');
            
            data.push([c.name, v, p, `${c.percentage}%`])
          })
          //format totalMonthlyNet 
          totalMonthlyNet = numberFormat(totalMonthlyNet)
          let title = vm.budget.pie_title;
          if (!title) {
            title = `${vm.budget.created_by.first_name || vm.budget.created_by.username}'s Typical<br>Monthly Budget<br>`
          }
          title = `<span style='fill: #fff; font-size: 1.2rem; font-weight: 600;'>${title}<br/><span style='fill: #22c9e4; font-size: 1.6rem; font-weight: 1000;'>$${totalMonthlyNet}</span> </span>`
          
          let subTitle = vm.budget.title;
          ChartService.draw3DDonut(`chartContainer-${vm.budget.id}`, data, {title, subTitle})
        }
        vm.totalNetAsset = 0;
        function onNetAssetTotalChange(total) {
          vm.totalNetAsset = total
          calculateNetAssetPerLiability()
        }
        vm.totalLiability = 0;
        function onLiabilityTotalChange(total) {
          vm.totalLiability = total
          calculateNetAssetPerLiability()
        }
        function calculateNetAssetPerLiability() {
          vm.assetPerLiability = vm.totalNetAsset - vm.totalLiability
        }
      }]
    }
  }
})();