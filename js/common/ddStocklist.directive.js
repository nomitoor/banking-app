(function () {
  'use strict';

  angular
    .module('fm')
    .directive('ddStocklist', ddStocklist);

  ddStocklist.$inject = [];
  function ddStocklist() {
    return {
      restrict: 'E',
      template: `
      <ui-select ng-model='ddModel[ddSubModel]' ng-change='vm.ddChange(ddModel[ddSubModel])' reset-search-input='false' name="uiSelectStockList" ng-required="required">
          <ui-select-match placeholder="Stock list" allow-clear="true">
              {{ $select.selected.name }}
          </ui-select-match>
          
          <ui-select-choices repeat='list.id as list in vm.stockLists | filter: $select.search'>
              <div ng-bind-html="list.name | highlight: $select.search"></div>
          </ui-select-choices>
          
      </ui-select>
      `,
      scope: {
        ddModel: "=",
        ddSubModel: '@',
        type: '@',
        ddChange: "=",
        required: '@',
        ddOptions: '='
      },
      link: (scope, element, attrs) => {   
        scope.ddSubModel = scope.ddSubModel || 'stock_list'
        scope.required = scope.required === 'required'? true: false;
      },
      controller: ['$scope', '$timeout', 'StockList', function($scope, $timeout, StockList) {
        var vm = this;
        
        activate();
        function activate() {
          vm.stocks = [];
          vm.init = null;
          vm.ddChange = ddChange;
          
          if($scope.ddOptions) {
            $scope.ddOptions.refresh = refresh;
            $scope.ddOptions.refreshAndSelect = refreshAndSelect;
          }
          getStockLists();
        }

        function getStockLists(name) {
          let query = {
            page: vm.page,
            page_size: 150,
            ordering : 'name',
            list_type: $scope.type
          }
          
          if (name) {
            query.name = name;
          }
    
          return StockList.getAll(query)
            .then(({results}) => {
            vm.stockLists = results;
            if(vm.stockLists.length) {
              if(!vm.init) {
                $scope.ddModel[$scope.ddSubModel] = vm.stockLists[0].id
                ddChange($scope.ddModel[$scope.ddSubModel]);
              }else {
                const found = _.find(vm.stockLists, s => s.id==vm.init)
                if(found) {
                  $scope.ddModel[$scope.ddSubModel] = null;
                  $timeout(()=>{
                    $scope.ddModel[$scope.ddSubModel] = found.id
                    ddChange($scope.ddModel[$scope.ddSubModel]);
                  },200)                  
                }
              }
              
              
            }
          }).catch(() => {
            
          })
        }
        function refresh() {
          vm.init = null;
          getStockLists()
        }
        
        function refreshAndSelect(id) {
          vm.init = id;
          getStockLists()
        }

        function ddChange(id) {
          if($scope.ddChange) {
            let _list = _.find(vm.stockLists, ['id', id]);
            if(_list) {
              $scope.ddChange.call(undefined, _list);
            }
          }
        }
      }],
      controllerAs: 'vm'
    }
  }
}) ();
  