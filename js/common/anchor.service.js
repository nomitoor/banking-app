(function () {
  'use strict';
angular.module('fm')
  .factory('AnchorService', AnchorService);
  AnchorService.$inject = ['$rootScope', '$location', '$anchorScroll'];
  function AnchorService($rootScope, $location, $anchorScroll) {

    function goto(hash) {
      var newHash = hash;
      if ($location.hash() !== newHash) {
        $location.hash(hash);
        $anchorScroll();
        $location.hash(null);
      } else {
        $anchorScroll();
      }
    };
    return {
      goto
    }
  }

})();