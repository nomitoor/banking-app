(function () {
  'use strict';

  angular
    .module('fm')
    .directive('toast', toast);

  toast.$inject = [];
  function toast() {
    return {
      restrict: 'E',
      template: ` 
<div class="position-fixed right-0 p-3" style="z-index: 5; right: 0px; top: 20px;" ng-if="vm.show">
  <div class="toast fm-toast {{ vm.options.borderClass }}" role="alert">
    <div class="toast-header bg-white">
      <div class="bd-placeholder-img rounded mr-2 {{ vm.options.bgClass }}" style="width:20px;height:20px"></div>
      <strong class="mr-auto">{{ vm.options.title }}</strong>
      <small></small>
      <button type="button" class="ml-2 mb-1 close" ng-click="vm.closeToast()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="toast-body">
      {{ vm.options.body }}
    </div>
  </div>
</div>
      `,
      scope: {
        
      },
      link: (scope, element, attrs) => {   
        
      },
      controllerAs: 'vm',
      controller: ['$scope', '$rootScope', '$timeout', function($scope, $rootScope, $timeout) { 
        let vm = this;
        var defaultOptions = {
          autoClose: 5000
        };
        let toastTimeout = null;
        activate()
        function activate() {
          console.log('[confirmModal] activate')
          vm.show = false;
          vm.options = {};
          
          vm.closeToast = closeToast;
        }
        function closeToast() {
          vm.show = false;
          $rootScope.$broadcast('TOAST_CLOSE');
        }
        
        $scope.$on("TOAST_SHOW", (e, options)=>{
          // if previous showing 
          if(vm.show) {
            $timeout.cancel(toastTimeout);
            closeToast();
          }
          vm.options = _.extend(options||{}, defaultOptions);
          if(typeof vm.options.autoClose!='number') vm.options.autoClose = 5000;
          if(vm.options.autoClose) {
            toastTimeout = $timeout(()=>{
              closeToast();
            },vm.options.autoClose)
          }
          $timeout(() => {
            vm.show = true;
          })
        })
      }]
    }
  }
})();