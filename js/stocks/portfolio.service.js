angular.module('fm')
  .factory('Portfolio', ['$http', 'AppConfig', function($http, AppConfig) {
    var PREFIX = AppConfig.API_PREFIX;
   
    function getAll(query) {
      console.log('[Portfolio] getAll()');
      query = _.extend({}, query)
      return $http.get(PREFIX + `stock/portfolios/`, {params: query})
        .then(function(res) {
          return res.data;
        });
    }

    function create(data) {
      return $http.post(`${PREFIX}stock/portfolios/`, data);
    }

    function update(id, data) {
      return $http.put(`${PREFIX}stock/portfolios/${id}/`, data);
    }
    
    function remove(id) {
      return $http.delete(`${PREFIX}stock/portfolios/${id}/`);
    }

    function addBalance(id, data) {
      return $http.post(`${PREFIX}stock/portfolios/${id}/add_balance/`, data);
    }

    function withdraw(id, data) {
      return $http.post(`${PREFIX}stock/portfolios/${id}/withdraw_balance/`, data);
    }
    return {
      /** databank */
      getAll,
      update,
      create,
      remove,
      withdraw,
      addBalance
    }

  }]);