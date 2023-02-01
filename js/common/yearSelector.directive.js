(function () {
  'use strict';

  angular.module('fm')
  .directive('yearSelector', ['$timeout', function($timeout) {
    return {
      restrict: 'E',
      template: `
      <select ng-model="ngModel" class="form-control" 
        ng-options="y for y in vm.yearRange"
        ng-change="ngChange && ngChange(ngModel)">
      </select>
      `,
      scope: {
        min: "=",
        max: "=",
        ngModel: '=',
        ngChange: '='
      },
      link: (scope, element, attrs) => {   
        
      },
      controllerAs: 'vm',
      controller: ['$scope', function($scope) { 
        var vm = this;
        var rangeMin, rangeMax;
        activate()
        function activate() {
          vm.yearRange = [];
          rangeMin = $scope.min||1;
          rangeMax = $scope.max||40; 

          buildRange();
        }
        function buildRange() {
          for(let i=rangeMin;i<=rangeMax;i++) {
            vm.yearRange.push(i)
          }
        }
      }]
    };
  }]);
})();