(function () {
  'use strict';

  angular
    .module('fm')
    .directive('ddStock', ddStock);

  ddStock.$inject = [];
  function ddStock() {
    return {
      restrict: 'E',
      template: `
      <ui-select ng-model='ddModel[ddSubModel]' ng-change='vm.ddChange(ddModel[ddSubModel])' reset-search-input='false' name="uiSelectScreener" ng-required="required">
          <ui-select-match placeholder="{{ placeholder||'Symbol' }}" allow-clear="true">
              {{ $select.selected.symbol }}
          </ui-select-match>
          
          <ui-select-choices repeat='stock in vm.stocks | filter: $select.search' refresh='vm.findStocks($select.search)' refresh-delay='250'>
              <div class="d-flex">
                <span ng-bind-html='stock.symbol | highlight: $select.search'></span>
                <span ng-if="stock.shortname" class="mx-2">-</span>
                <span ng-if="stock.shortname" ng-bind-html="stock.shortname | highlight: $select.search"></span>
              </div> 
              
          </ui-select-choices>
          
      </ui-select>
      `,
      scope: {
        ddModel: "=",
        ddSubModel: '@',
        ddChange: "=",
        required: '@',
        placeholder: '@'
      },
      link: (scope, element, attrs) => {   
        scope.ddSubModel = scope.ddSubModel || 'stock'
        scope.required = scope.required === 'required'? true: false;
      },
      controller: ['$scope', 'StockService', 'YahooService', function($scope, StockService, YahooService) {
        var vm = this;
        
        activate();
        function activate() {
          vm.stocks = [];
          vm.ddChange = ddChange;
          vm.findStocks = findStocks;
        }

        function findStocks(q) {
          if(!q) return;
          return YahooService.findStocks(q)
            .then(({quotes}) => {
            vm.stocks = quotes;
            
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