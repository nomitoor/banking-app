(function () {
  'use strict';

  angular
    .module('fm')
    .directive('buyStock', BuyStock);

  BuyStock.$inject = [];
  function BuyStock() {
    return {
      restrict: 'E',
      template: ` 
<div class="modal d-block" ng-if="vm.show">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Buy Stock</h5>
        <button type="button" class="close" ng-click="vm.show=false">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <form class="form" name="vm.form" ng-submit="vm.onBuy()">
        <div class="modal-body">  
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Portfolio</label>
            <div class="col-sm-8">
              <div class="form-control">{{ vm.currentPortfolio.name }}</div>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Symbol</label>
            <div class="col-sm-8">
              <div class="form-control">{{ vm.stockInfo.symbol }}</div>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Name</label>
            <div class="col-sm-8">
              <div class="form-control">{{ vm.stockInfo.shortname }}</div>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Investment</label>
            <div class="col-sm-8">
              <div class="form-control">{{ vm.dividendInfo.investmentCash | currency:'$' }}</div>
              <div>= <span class="text-success">{{ vm.buyInfo.init_share }}</span> (Share) * <span class="text-success">{{ vm.buyInfo.init_price | currency:'$'}}</span> (Per Share)</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" ng-click="vm.show=false">Close</button>
          <button type="submit" class="btn btn-success" 
            ng-disabled="!vm.form.$valid">
            <i class="material-icons">shopping_cart</i>
            Buy
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

          vm.onBuy = onBuy
        }

        function buy(stock) {
          return StockService.buyDividendStock(stock)
            .then(()=>{
              ToastService.success({
                title: 'Buy stock success',
                body: 'The stock has been added to your porfolio'
              })
            })
            .catch(({data})=>{
              let msg = 'There is an issue when adding stock to your portfolio'
              if (data && data.non_field_errors) {
                msg = 'This stock is already exist in your porfolio';
              }
              ToastService.danger({
                title: 'Buy stock failed',
                body: msg
              })
            })
        }
        function onBuy() {
          if(!vm.form.$valid) {
            return;
          }
          const _buyInfo = _.clone(vm.buyInfo)
          _buyInfo.portfolio = vm.currentPortfolio.id
          if (_buyInfo.initType === 'cash') { // recalculate amount
            _buyInfo.init_amount = _.round(vm.dividendInfo.investmentCash, 2)
          }
          buy(_buyInfo)
            .then(() => {
              vm.show = false;
              $rootScope.$broadcast('BUY_STOCK_CONFIRM');
            })          
        }
        
        $scope.$on("BUY_STOCK_SHOW", (e, stockInfo, buyInfo, dividendInfo, currentPortfolio)=>{
          vm.stockInfo = stockInfo;
          vm.buyInfo = buyInfo;
          vm.dividendInfo = dividendInfo;
          vm.currentPortfolio = currentPortfolio
          vm.show = true;
        })
      }]
    }
  }
})();