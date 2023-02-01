(function () {
  'use strict';

  angular
    .module('fm')
    .directive('ddDatabank', ddDatabank);

  ddDatabank.$inject = [];
  function ddDatabank() {
    return {
      restrict: 'E',
      template: `
      <ui-select ng-model='ddModel[ddSubModel]' ng-change='vm.ddChange(ddModel[ddSubModel])' reset-search-input='false' name="uiSelectDatabank" ng-required="required">
          <ui-select-match placeholder="Symbol" allow-clear="true">
              {{ $select.selected.code }}
          </ui-select-match>
          
          <ui-select-choices repeat='stock.code as stock in vm.stocks | filter: $select.search'>
              <div ng-bind-html='stock.code | highlight: $select.search'></div> 
              <small ng-bind-html="stock.name | highlight: $select.search"></small>
          </ui-select-choices>
          
      </ui-select>
      `,
      scope: {
        ddModel: "=",
        ddSubModel: '@',
        ddChange: "=",
        required: '@',
        ddInit: '@'
      },
      link: (scope, element, attrs) => {   
        scope.ddSubModel = scope.ddSubModel || 'code'
        scope.required = scope.required === 'required'? true: false;
      },
      controller: ['$scope', 'Databank', function($scope, Databank) {
        var vm = this;
        
        activate();
        function activate() {
          vm.stocks = [];
          vm.ddChange = ddChange;
          
          getStocks();
        }

        function getStocks(code) {
          let query = {
            page: vm.page,
            page_size: 150,
            ordering : 'code'
          }
          
          if (code) {
            query.code = code;
          }
    
          return Databank.getAll(query)
            .then(({results}) => {
            vm.stocks = results;
            if($scope.ddInit) {
              const found = _.find(vm.stocks, (s => s.id==$scope.ddInit))
              if (found) {
                $scope.ddModel[$scope.ddSubModel] = found.code
              }
            }
          }).catch(() => {
            
          })
        }

        function ddChange(code) {
          if($scope.ddChange) {
            let _stock = _.find(vm.stocks, ['code', code]);
            if(_stock) {
              $scope.ddChange.call(undefined, _stock);
            }
          }
        }
      }],
      controllerAs: 'vm'
    }
  }
}) ();
  