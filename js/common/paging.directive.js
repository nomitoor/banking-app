(function () {
  'use strict';

  angular
    .module('fm')
    .directive('paging', paging);

  paging.$inject = [];
  function paging() {
    return {
      restrict: 'E',
      template: `
      <div class="paging d-flex">
        <div class="">Total: {{ total }}</div>
        <div class="ml-auto">
          <span class="mr-2">Showing {{ vm.showing }}</span>
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-info" ng-disabled="currentPage===1" ng-click="vm.goBack()">
              <i class="material-icons">arrow_back_ios</i>
              <span>Back</span>
            </button>
            <button type="button" class="btn btn-info" ng-disabled="currentPage===vm.lastPage" ng-click="vm.goNext()">
              <span>Next</span>
              <i class="material-icons">arrow_forward_ios</i>
            </button>
          </div>
        </div>
      </div>
      `,
      scope: {
        total: "=",
        pageSize: '=',
        currentPage: '=',
        callback: "="
      },
      link: (scope, element, attrs) => {   
        
      },
      controller: ['$scope', function($scope) {
        var vm = this;
        
        activate();
        function activate() {
          vm.lastPage = 1;
          vm.goBack = goBack;
          vm.goNext = goNext;

          calcLastPage();
          calcShowing();

          $scope.$watch('total', (n,o)=>{
            if(n!=o) {
              calcLastPage();
              calcShowing();
            }
          })

          $scope.$watch('currentPage', (n,o)=>{
            if(n!=o) {
              calcShowing();
            }            
          })
        }
        function calcLastPage() {
          vm.lastPage = Math.ceil($scope.total/$scope.pageSize);
        }

        function calcShowing() {
          let to = ($scope.currentPage-1)*$scope.pageSize+$scope.pageSize;
          if(to>$scope.total) {
            to = $scope.total;
          }
          vm.showing = `${($scope.currentPage-1)*$scope.pageSize+1} - ${to}`;
        }

        function goBack() {
          if($scope.currentPage===1)return;
          if($scope.callback && $scope.callback.goBack) {
            $scope.callback.goBack()
          }
        }

        function goNext() {
          if($scope.currentPage===$scope.lastPage)return;
          if($scope.callback && $scope.callback.goNext) {
            $scope.callback.goNext()
          }
        }
        
      }],
      controllerAs: 'vm'
    }
  }
}) ();
  