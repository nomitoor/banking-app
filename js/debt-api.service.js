angular.module('fm')
  .factory('DebtApi', ['$http', 'AppConfig', function($http, AppConfig) {
    var PREFIX = AppConfig.API_PREFIX;
    
    /** Debt API */
    function getDebts() {
      console.log('[ApiService] getDebts():');
      var config = {page: 1, page_size:100};
      
      return $http.get(PREFIX + `debt/debts/`, {params: config})
        .then(function(res) {
          return res.data;
        });
    }

    function updateDebt(id, data) {
      return $http.patch(`${PREFIX}debt/debts/${id}/`, data);
    }

    function copyDebt() {
      return $http.post(PREFIX + `debt/debts/copy/`, {})
    }

    function deleteDebt(id) {
      return $http.delete(PREFIX + `debt/debts/${id}/`)
    }
    
    function createCategory(data) {
      return $http.post(PREFIX + `debt/categories/`, data)
    }

    function updateCategory(id, data) {
      return $http.put(`${PREFIX}debt/categories/${id}/`, data);
    }

    function deleteCategory(id) {
      return $http.delete(`${PREFIX}debt/categories/${id}/`) 
    }

    function createItem(data) {
      return $http.post(`${PREFIX}debt/category_items/`, data)
    }

    function updateItem(id, data) {
      return $http.put(`${PREFIX}debt/category_items/${id}/`, data);
    }

    function deleteItem(id) {
      return $http.delete(`${PREFIX}debt/category_items/${id}/`) 
    }

    function createLiability(data) {
      return $http.post(`${PREFIX}debt/liabilites/`, data)
    }

    function updateLiability(id, data) {
      return $http.put(`${PREFIX}debt/liabilites/${id}/`, data);
    }

    function createLiabilityItem(data) {
      return $http.post(`${PREFIX}debt/liability_items/`, data)
    }

    function updateLiabilityItem(id, data) {
      return $http.put(`${PREFIX}debt/liability_items/${id}/`, data);
    }

    function deleteLiabilityItem(id) {
      return $http.delete(`${PREFIX}debt/liability_items/${id}/`) 
    }

    return {
      /** DEBT */
      getDebts,
      updateDebt,
      copyDebt,
      deleteDebt,
      createCategory,
      updateCategory,
      deleteCategory,
      createItem,
      updateItem,
      deleteItem,
      createLiability,
      updateLiability,
      createLiabilityItem,
      updateLiabilityItem,
      deleteLiabilityItem
    }

  }]);