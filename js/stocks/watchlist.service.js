angular.module('fm')
  .factory('Watchlist', ['$http', 'AppConfig', function($http, AppConfig) {
    var PREFIX = AppConfig.API_PREFIX;
   
    function getAll(query) {
      console.log('[Databank] getAll()');
      query = _.extend({}, query)
      return $http.get(PREFIX + `stock/watchlists/`, {params: query})
        .then(function(res) {
          return res.data;
        });
    }

    function create(data) {
      return $http.post(`${PREFIX}stock/watchlists/`, data);
    }

    function update(id, data) {
      return $http.put(`${PREFIX}stock/watchlists/${id}/`, data);
    }
    
    function partialUpdate(id, data) {
      return $http.patch(`${PREFIX}stock/watchlists/${id}/`, data);
    }

    function remove(id, data) {
      return $http.delete(`${PREFIX}stock/watchlists/${id}/`);
    }

    return {
      /** databank */
      getAll,
      update,
      partialUpdate,
      create,
      remove
    }

  }]);