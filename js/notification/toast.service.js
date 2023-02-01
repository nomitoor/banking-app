angular.module('fm')
  .factory('ToastService', ['$rootScope', '$q', function($rootScope) {
    
    function show(options) {
      console.log('[ToastService] show()');
      $rootScope.$broadcast('TOAST_SHOW', options||{})
    }

    function success(options) {
      options = _.extend(options, {bgClass: 'bg-success', borderClass: 'border-success'})
      show(options);
    }

    function danger(options) {
      options = _.extend(options, {bgClass: 'bg-danger', borderClass: 'border-danger'})
      show(options);
    }
    
    return {
      show,
      success,
      danger
    }

  }]);