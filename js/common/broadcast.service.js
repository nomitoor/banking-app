(function () {
  'use strict';
angular.module('fm')
  .factory('Broadcast', Broadcast);
  Broadcast.$inject = ['$rootScope'];
  function Broadcast($rootScope) {

    function send(name, data) {
      $rootScope.$broadcast(name, data)
    }

    function on(name, cb) {
      $rootScope.$on(name, cb)
    }
    
    return {
      send,
      on
    }
  }

})();