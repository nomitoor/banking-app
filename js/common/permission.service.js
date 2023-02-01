(function () {
  'use strict';
angular.module('fm')
  .factory('PermissionService', PermissionService);
  PermissionService.$inject = ['$rootScope', '$location'];
  function PermissionService($rootScope, $location) {
    
    function hasPermission(model, action) {
      console.log('hasPermission:', $rootScope.me)
      if(!$rootScope.me) {
        return $location.path('/login');
      }
      //always true if is_superuser
      if ($rootScope.me && $rootScope.me.is_superuser) return true;
      action = action || 'view'
      let codename = `${action}_${model}`;
      let has = _.find($rootScope.permissions, ['codename', codename])
      if(has) {
        return true;
      }
      return false;
    }

    function firstAuthPage() {
      let models = {
        'budget':'budgets',
        'debt':'gds-tds', 
        'stock': 'stock-valuable',
        'intrinsicstock': 'intrinsic-value',
      }
      let res = false;
      _.each(models, (v,k)=>{
        if(is_permit(k)) {
          res = v;
          return false;
        }        
      })
      return res;
    }
    
    function is_permit(model) {
      if(!hasPermission(model)){
        $location.path('/403');
        return false;
      }
      return true;
    }

    return {
      hasPermission,
      is_permit,
      firstAuthPage
    }
  };
})();