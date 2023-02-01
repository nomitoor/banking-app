(function () {
  'use strict';

  angular
    .module('fm')
    .directive('sellStock', SellStock);

  SellStock.$inject = [];
  function SellStock() {
    return {
      restrict: 'E',
      template: ` 
<div class="modal d-block" ng-if="vm.show">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Sell Stock</h5>
        <button type="button" class="close" ng-click="vm.show=false">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <form class="form" name="vm.form" ng-submit="vm.onSell()">
        <div class="modal-body">  
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Portfolio</label>
            <div class="col-sm-8">
              <div class="form-control">{{ vm.portfolio.name }}</div>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Stock</label>
            <div class="col-sm-8">
              <div class="form-control">{{ vm.stockInfo.symbol }} - {{ vm.stockInfo.displayName }} </div>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Sell Amount</label>
            <div class="col-sm-6 pr-0">
              <input class="form-control border-info" ng-model="vm.sellAmount" max="{{ vm.stockInfo.init_share }}" type="number">
            </div>
            <div class="col-sm-2 pl-1 pt-2">/{{ vm.stockInfo.init_share }}</div>
          </div>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">At Price</label>
            <div class="col-sm-8">
              <input class="form-control border-info" ng-model="vm.sellPrice" type="number" step="any">
              <div>= <span class="text-success">{{ vm.sellAmount }} * {{ vm.sellPrice | currency:'$' }} - $9.99 (fee)</span></div>
              <div>= <span class="text-success">{{ (vm.sellAmount * vm.sellPrice - 9.99) | currency:'$' }}</span></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" ng-click="vm.show=false">Close</button>
          <button type="submit" class="btn btn-danger" 
            ng-disabled="!vm.form.$valid">
            <i class="material-icons">local_atm</i>
            Sell
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
<div class="modal-backdrop fade show" ng-if="vm.show"></div>
      `,
      scope: {
        
      },
      link: (scope, element, attrs) => {   
        
      },
      controllerAs: 'vm',
      controller: ['$scope', '$rootScope', 'StockService', 'ToastService', 
      function($scope, $rootScope, StockService, ToastService) { 
        let vm = this;
        
        activate()
        function activate() {
          console.log('[confirmModal] activate')
          vm.show = false
          vm.stockInfo = null;
          vm.portfolio = null;
          vm.sellAmount = 0;
          vm.sellPrice = 0;
          vm.onSell = onSell
        }

        function sell(stockId, data) {
          return StockService.sellDividendStock(stockId, data)
            .then(()=>{
              ToastService.success({
                title: 'Sell Stock',
                body: 'Your stock has been sold'
              })
            })
            .catch(({data})=>{
              let msg = 'There is an issue when processing. Please check and try again!'
              ToastService.danger({
                title: 'Sell Stock',
                body: msg
              })
            })
        }
        function onSell() {
          if(!vm.form.$valid) {
            return;
          }
          
          sell(vm.stockInfo.id, {
            amount: vm.sellAmount,
            price: vm.sellPrice
          })
            .then(() => {
              vm.show = false;
              $rootScope.$broadcast('SELL_STOCK_CONFIRM');
            })          
        }
        
        $scope.$on("SELL_STOCK_SHOW", (e, stockInfo, portfolio)=>{
          vm.stockInfo = stockInfo;
          vm.portfolio = portfolio;
          vm.show = true;
          vm.sellAmount = stockInfo.init_share;
          vm.sellPrice = stockInfo.currentStockPrice;
        })
      }]
    }
  }
})();