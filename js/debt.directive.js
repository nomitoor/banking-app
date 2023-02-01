(function () {
  'use strict';

  angular
    .module('fm')
    .directive('fmDebt', fmDebt);

  fmDebt.$inject = ['$timeout', '$filter', '$interval', 'ChartService', 'ApiService', 'DebtApi', 'ConfirmService'];
  function fmDebt($timeout, $filter, $interval, ChartService, ApiService, DebtApi, ConfirmService) {
    return {
      restrict: 'E',
      templateUrl: 'views/fm-debt.html',
      scope: {
        debt: "=",
        callback: "="
      },
      link: (scope, element, attrs) => {   
        
      },
      controllerAs: 'vm',
      controller: ['$scope', function($scope) { 
        let vm = this;

        activate()
        function activate() {
          console.log('[fmDebt] activate')
          vm.debt = $scope.debt;
          vm.categoryCallback = {};

          vm.categoryCallback.deleteCategory = onDeleteCategory;
          vm.categoryCallback.saveCategory = onSaveCategory;
          vm.categoryCallback.categoryReady = categoryReady;
          vm.addCategory = addCategory;

          vm.categoryCallback.saveItem = onSaveItem;
          vm.categoryCallback.deleteItem = onDeleteItem;
          
          vm.saveDebt = saveDebt;
          vm.deleteDebt = deleteDebt;
          vm.printDebt = printDebt;
          
          calculateGdsTds();

          $timeout(()=>{
            drawChart();
          },20)
          
          vm.debt.time = getCurrentTime()
          $interval(()=>{
            vm.debt.time = getCurrentTime()
          },60000)
        }
        function categoryReady() {
          
        }

        function getCurrentTime() {
          let currentTime = new Date()
          let tz = Intl.DateTimeFormat().resolvedOptions().timeZone
          let m = moment().tz(tz)
          
          const timeStr = $filter('date')(currentTime, 'MMM d, y hh:mm a')
          return `${timeStr} ${m.format("z")}`
        }


        function saveDebt(debt) {
          vm.debt.editing = false;
          
          DebtApi.updateDebt(debt.id, _.pick(debt,['name', 'd_type']))
            .then(()=>{
              console.log('[debt.directive.js] saveDebt then')
              drawChart();
            })
        }

        function deleteDebt(debt) {
          ConfirmService.show()
            .then(()=>{
              DebtApi.deleteDebt(debt.id)
                .then(()=>{
                  console.log('[debt.directive.js] deleteDebt then')
                  if($scope.callback && $scope.callback.deleteDebt) {
                    $scope.callback.deleteDebt(debt)
                  }
                })
          })
        }

        function onDeleteCategory(category) {
          _.remove(vm.debt.expenses, ['id', category.id])
          calculateGdsTds();
          drawChart();
        }
    
        function addCategory() {
          vm.debt.expenses.push({
            id: `c_${Math.random()}`,
            name: "",
            debt: vm.debt.id,
            editing: true,
            items: []
          })
        }
        
        function onSaveItem(item, category) {
          calculateGdsTds();
          drawChart();
        }

        function onDeleteItem(item, category) {
          calculateGdsTds();
          drawChart();
        }
    
    
        function onSaveCategory(category) {
          if(!category.items.length) {
            vm.debt.expense.items.push(newExpenseItem)
          }
        }
    
        function calculateGdsTds() {
          //total expense/ total income 
          let totalExpense = _.sumBy(vm.debt.expenses, 'total')
          let totalIncome =  _.sumBy(vm.debt.incomes, 'total')
          let totalLiability = _.sumBy(vm.debt.liabilities, 'total')
          vm.debt.totalIncomes = totalIncome
          vm.debt.totalExpenses = totalExpense
          vm.debt.totalLiabilities = totalLiability

          vm.debt.gds = _.round(100*((totalExpense+totalLiability)/totalIncome),2) || 0;
          vm.debt.tds = vm.debt.gds;

        }
        function drawChart() {
          let cId = `ChartContainer-${vm.debt.id}`;
          let standard = 32;
          let title = 'Gross Debt Service Ratio';
          if (vm.debt.d_type==2) {
            standard = 40;
            title = 'Total Debt Service Ratio';
          }
          ChartService.drawProgress(cId, vm.debt.gds, {standard, title});
          
        }

        function printDebt() {
          let includes = ['css/app.css', 'libs/bootstrap.min.css', 'css/printjs.css']
          if (ENV && ENV=='production') {
            includes = ['/app.min.css', 'css/bootstrap.min.css', 'css/printjs.css']
          }
          printJS({
            printable: 'd_' + vm.debt.id,
            type: 'html',
            css: includes,
            maxWidth: '1024px',
            targetStyles: ["*"]
          })
    
        }

      }]
    }
  }
})();