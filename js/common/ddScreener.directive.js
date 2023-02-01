(function () {
  'use strict';

  angular
    .module('fm')
    .directive('ddScreener', ddScreener);

  ddScreener.$inject = [];
  function ddScreener() {
    return {
      restrict: 'E',
      template: `
      <ui-select ng-model='ddModel[ddSubModel]' ng-change='vm.ddChange(ddModel[ddSubModel])' reset-search-input='false' name="uiSelectScreener" ng-required="required">
          <ui-select-match placeholder="Symbol" allow-clear="true">
              {{ $select.selected.code }}
          </ui-select-match>
          
          <ui-select-choices repeat='stock.code as stock in vm.stocks | filter: $select.search' refresh='vm.getStocks($select.search)' refresh-delay='250'>
              <div class="d-flex">
                <span ng-bind-html='stock.code | highlight: $select.search'></span>
                <span ng-if="stock.name" class="mx-2">-</span>
                <span ng-if="stock.name" ng-bind-html="stock.name | highlight: $select.search"></span>
              </div> 
              
          </ui-select-choices>
          
      </ui-select>
      `,
      scope: {
        ddModel: "=",
        ddSubModel: '@',
        ddChange: "=",
        required: '@'
      },
      link: (scope, element, attrs) => {   
        scope.ddSubModel = scope.ddSubModel || 'code'
        scope.required = scope.required === 'required'? true: false;
      },
      controller: ['$scope', 'Screener', function($scope, Screener) {
        var vm = this;
        let fullLoaded = false;
        activate();
        function activate() {
          vm.stocks = [];
          vm.ddChange = ddChange;
          vm.getStocks = getStocks;
          getStocks();
        }

        function getStocks(search) {
          if (fullLoaded) return;
          let query = {
            page: vm.page,
            page_size: 50,
            ordering : 'code'
          }
          
          if (search) {
            query.search = search;
          }
    
          return Screener.getAll(query)
            .then((data) => {
              if (data.count<=50) {
                fullLoaded = true;
              }
            vm.stocks = data.results;
            
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
  