angular.module('fm')
  .factory('StockList', ['$http', 'AppConfig', function($http, AppConfig) {
    var PREFIX = AppConfig.API_PREFIX;
   
    function getAll(query) {
      console.log('[StockList] getAll()');
      query = _.extend({}, query)
      return $http.get(PREFIX + `stock/stock_lists/`, {params: query})
        .then(function(res) {
          return res.data;
        });
    }

    function create(data) {
      return $http.post(`${PREFIX}stock/stock_lists/`, data);
    }

    function update(id, data) {
      return $http.put(`${PREFIX}stock/stock_lists/${id}/`, data);
    }
    
    function partialUpdate(id, data) {
      return $http.patch(`${PREFIX}stock/stock_lists/${id}/`, data);
    }

    function remove(id, data) {
      return $http.delete(`${PREFIX}stock/stock_lists/${id}/`);
    }

    return {
      
      getAll,
      update,
      partialUpdate,
      create,
      remove
    }

  }]);