(function () {
  'use strict';

  angular.module("fm")
  .controller("RootController", RootController);
  RootController.$inject = ['$scope', '$rootScope', '$timeout', '$location', 'PermissionService'];
  function RootController($scope, $rootScope, $timeout, $location, PermissionService){
    let vm = this;
    
    activate();
    function activate() {
      console.log('[root.controller.js] activate')
      
      $timeout(()=>{
        let page = PermissionService.firstAuthPage();
        $location.path(page);

      },100)

    }

    

  };

})();
