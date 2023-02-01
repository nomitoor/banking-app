(function () {
  'use strict';

  angular.module('fm')
  .directive('autoFocus', ['$timeout', function($timeout) {
    return {
        link: function (scope, element, attrs) {
            attrs.$observe("autoFocus", function(newValue){
                if (newValue === "true")
                    $timeout(function(){element[0].focus()});
            });
        }
    };
  }]);
})();