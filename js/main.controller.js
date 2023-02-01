(function () {
  'use strict';

  angular.module("fm")
    .controller("MainController", MainController)
  
  MainController.$inject = ['$scope', '$rootScope', '$timeout', '$location', '$interval',
  'ApiService', 'PermissionService', 'Broadcast'];

  function MainController($scope, $rootScope, $timeout, $location, $interval,
    ApiService, PermissionService, Broadcast){
    let vm = this;

    activate();
    console.log($location.path())
    function activate() {
      vm.user = {
        name: '',
      }
      vm.currentTime = null;
      vm.timezone = getTimezone();
      vm.openMenu = false;
      vm.isLoggedIn = $rootScope.me;
      vm.currentPath = $location.path();
      
      vm.dropdownMenu = {};

      vm.doLogout = doLogout;
      vm.navigate = navigate;
      vm.bodyClick = bodyClick;
      vm.showDropdown = showDropdown;

      $scope.$on('LOGGEDIN', (e,data) => {
        vm.user = data; 
        vm.isLoggedIn = true;
      })
      $rootScope.$on('$routeChangeSuccess', (event, toState, toParams, fromState, fromParams)=>{ 
        vm.currentPath = $location.path()
      })

      startClock();
    }
    
    function doLogout() {
      console.log('[main.controller.js] doLogout')
      ApiService.logout();
      vm.isLoggedIn = false;
      $timeout(()=>{
        $location.path('/login');
      },100)
      
    }

    function hideDropdown() {
      _.each(vm.dropdownMenu,(v, k)=>{
        vm.dropdownMenu[k] = false;
      })
    }
    function navigate(path) {
      $location.path(path);
      vm.openMenu = false;
      hideDropdown();
    }

    function bodyClick() {
      hideDropdown();
      Broadcast.send('BODY_CLICKED');
    }
    function showDropdown(menu, e) {
      hideDropdown();
      vm.dropdownMenu[menu] = true;  
      e.stopPropagation();
    }

    function getTimezone() {
      let tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      let m = moment().tz(tz)
      return m.format("z");
    }
    function startClock() {
      vm.currentTime = new Date();
      $interval(()=>{
        vm.currentTime = new Date();
      },30000)
    }
    
  }
})();
