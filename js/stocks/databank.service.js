angular.module('fm')
  .factory('Databank', ['$http', 'AppConfig', function($http, AppConfig) {
    var PREFIX = AppConfig.API_PREFIX;
   
    function getAll(query) {
      console.log('[Databank] getAll()');
      query = _.extend({}, query)
      return $http.get(PREFIX + `stock/databanks/`, {params: query})
        .then(function(res) {
          return res.data;
        });
    }

    function create(data) {
      return $http.post(`${PREFIX}stock/databanks/`, data);
    }

    function update(id, data) {
      return $http.put(`${PREFIX}stock/databanks/${id}/`, data);
    }
    
    function partialUpdate(id, data) {
      return $http.patch(`${PREFIX}stock/databanks/${id}/`, data);
    }

    function remove(id, data) {
      return $http.delete(`${PREFIX}stock/databanks/${id}/`);
    }

    function sectors() {
      return $http.get(`${PREFIX}stock/databanks/sectors/`);
    }
    function industries() {
      return $http.get(`${PREFIX}stock/databanks/industries/`);
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