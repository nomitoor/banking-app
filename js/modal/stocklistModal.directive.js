(function () {
  'use strict';

  angular
    .module('fm')
    .directive('stocklistModal', StocklistModal);

  StocklistModal.$inject = [];
  function StocklistModal() {
    return {
      restrict: 'E',
      template: ` 
<div class="modal d-block" ng-if="show">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title"> {{ vm.actionName}} {{ vm.typeName }}</h5>
        <button type="button" class="close" ng-click="vm.onCancel()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <form name="vm.newForm" ng-submit="vm.onSubmit()">
        <div class="modal-body">
          <div class="form-group">
            <label for="forName">Name</label>
            <input type="text" class="form-control" id="forName" placeholder="{{ vm.typeName }}" ng-model="vm.newList.name" auto-focus="true">
            <small id="emailHelp" class="form-text text-muted">Your list name should simple and easy to remember.</small>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" ng-click="vm.onCancel()">Cancel</button>
          <button type="submit" class="btn btn-success" ng-if="action!='update'">
            <i class="material-icons">add</i>
            Save
          </button>
          <button type="submit" class="btn btn-primary" ng-if="action=='update'">
            Save
          </button>  
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
<div class="modal-backdrop fade show" ng-if="show"></div>
      `,
      scope: {
        onSuccess: '=',
        onError: '=',
        type: '@',
        action: '=',
        show: '=',
        data: '='
      },
      link: (scope, element, attrs) => {   
        
      },
      controllerAs: 'vm',
      controller: ['$scope', '$rootScope', 'StockList', 'ToastService', function($scope, $rootScope, StockList, ToastService) { 
        let vm = this;
        
        activate()
        function activate() {
          console.log('[stocklistModal] activate');
          vm.newList = {};
          vm.options = {};
          vm.onSubmit = onSubmit;
          vm.onCancel = onCancel;

          $scope.$watch('show', (n, o)=>{
            vm.typeName = $scope.type;
            vm.newList = {};
            vm.actionName = $scope.action==='update'?'Update': 'New';
            if($scope.data && $scope.action==='update') {
              vm.newList = _.clone($scope.data)
            }
            if(!vm.newList.list_type) {
              vm.newList.list_type = $scope.type.toLowerCase()==='watchlist'?0:1
            }
          })
        }

        function onSubmit() {
          if(vm.newForm.$valid) {
            if($scope.action.toLowerCase()=='update') {
              StockList.partialUpdate(vm.newList.id, {name: vm.newList.name})
              .then(({data}) => {
                ToastService.success({
                  title: 'Update databank',
                  body: 'Update databank success.'
                })
                if($scope.onSuccess) {
                  $scope.onSuccess(data)
                }
                $scope.show = false;
                //clear form
                vm.newList.name = '';
              })
              .catch(err => {
                ToastService.danger({
                  title: 'Update databank',
                  body: 'Failed to update databank.'
                })
                if($scope.onError) {
                  $scope.onError(err)
                }
              })
            }else{
              StockList.create(vm.newList) 
                .then(({data}) => {
                  ToastService.success({
                    title: 'New databank',
                    body: 'Create new databank success.'
                  })
                  if($scope.onSuccess) {
                    $scope.onSuccess(data)
                  }
                  $scope.show = false;
                  //clear form
                  vm.newList.name = '';
                })
                .catch(err => {
                  ToastService.danger({
                    title: 'New databank',
                    body: 'Failed to create new databank.'
                  })
                  if($scope.onError) {
                    $scope.onError(err)
                  }
                })
            }
          }
        }
        function onCancel() {
          $scope.show = false;
        }
      }]
    }
  }
})();