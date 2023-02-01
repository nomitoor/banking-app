(function () {
  'use strict';

  angular
    .module('fm')
    .directive('confirmModal', confirmModal);

  confirmModal.$inject = [];
  function confirmModal() {
    return {
      restrict: 'E',
      template: ` 
<div class="modal d-block" ng-if="vm.show">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ vm.options.title }}</h5>
        <button type="button" class="close" ng-click="vm.show=false">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>{{ vm.options.content }}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" ng-click="vm.show=false">Close</button>
        <button type="button" class="btn {{ vm.options.confirmBtnClass }}" ng-click="vm.onConfirm()">
          <i class="material-icons">{{ vm.options.confirmBtnIcon }}</i>
          {{ vm.options.confirmBtn }}
        </button>  
        </div>
      </div>
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
      controller: ['$scope', '$rootScope', function($scope, $rootScope) { 
        let vm = this;
        var defaultOptions = {
          title: 'Delete Confirm',
          content: 'Do you want to delete this?',
          confirmBtnClass: 'btn-danger',
          confirmBtnIcon: 'delete',
          confirmBtn: 'Delete'
        };
        activate()
        function activate() {
          console.log('[confirmModal] activate')
          vm.show = false
          vm.options = {};
          
          vm.onConfirm = onConfirm;
        }

        function onConfirm() {
          vm.show = false;
          $rootScope.$broadcast('CONFIRM_MODAL_CONFIRM');
        }
        
        $scope.$on("CONFIRM_MODAL_SHOW", (e, options)=>{
          vm.show = true;
          options = options || {}
          vm.options = _.extend(defaultOptions, options);
        })
      }]
    }
  }
})();