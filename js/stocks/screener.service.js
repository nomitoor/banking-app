angular.module('fm')
  .factory('Screener', ['$http', 'AppConfig', function($http, AppConfig) {
    var PREFIX = AppConfig.API_PREFIX;
   
    function getAll(query) {
      console.log('[Databank] getAll()');
      query = _.extend({}, query)
      return $http.get(PREFIX + `stock/screeners/`, {params: query})
        .then(function(res) {
          return res.data;
        });
    }

    function create(data) {
      return $http.post(`${PREFIX}stock/screeners/`, data);
    }

    function update(id, data) {
      return $http.put(`${PREFIX}stock/screeners/${id}/`, data);
    }

    function partialUpdate(id, data) {
      return $http.patch(`${PREFIX}stock/screeners/${id}/`, data);
    }

    function remove(id) {
      return $http.delete(`${PREFIX}stock/screeners/${id}/`);
    }
    function sectors() {
      return $http.get(`${PREFIX}stock/screeners/sectors/`);
    }
    function industries() {
      return $http.get(`${PREFIX}stock/screeners/industries/`);
    }
    return {
      /** databank */
      getAll,
      update,
      partialUpdate,
      create,
      remove,
      sectors,
      industries
    }

  }]);