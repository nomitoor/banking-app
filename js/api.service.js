angular.module('fm')
  .factory('ApiService', ['$rootScope', '$http', '$location', 'AppConfig', function($rootScope, $http, $location, AppConfig) {
    var PREFIX = AppConfig.API_PREFIX;
    var TOKEN = null;

    function login(username, password) {
      console.log('[ApiService] login():', username);
      return $http.post(PREFIX + "auth/login/", {
        username: username,
        password: password
      })
        .then(function(response) {
          TOKEN = response.data.token;
          $http.defaults.headers.common.Authorization = 'JWT ' + TOKEN;
          localStorage.setItem('t',TOKEN);
        });
    }

    function logout() {
      console.log('[ApiService] logout()');
      TOKEN = '';
      localStorage.removeItem('t');
      $http.defaults.headers.common.Authorization = undefined;
      $rootScope.me = null;
    }

    function parsePermission(user) {
      let permissions = user.user_permissions;
      _.each(user.groups, (g)=>{
        if(g.permissions) {
          permissions = _.concat(permissions, g.permissions)
        }
      })
      return permissions;
    }

    function getProfile() {
      console.log('[ApiService] getProfile()');
      if($rootScope.me) {
        return Promise.resolve($rootScope.me);
      }
      return $http.get(PREFIX + 'user/profile/')
        .then(function(res) {
          console.log('[ApiService] getProfile() then');
          $rootScope.me = res.data;
          $rootScope.permissions = parsePermission($rootScope.me);
          $rootScope.$broadcast('LOGGEDIN', res.data);
          return res.data;
        })
        .catch((error)=>{
          console.log('[ApiService] getProfile() catch');
          if(error.status==401) {
            logout();
          }
        })

      
    }

    /** Budget API */
    function getBudgets() {
      console.log('[ApiService] getBudgets():');
      var config = {page: 1, page_size:100};
      
      return $http.get(PREFIX + `budget/budgets/`, {params: config})
        .then(function(res) {
          return res.data;
        });
    }

    function updateBudget(id, data) {
      return $http.patch(`${PREFIX}budget/budgets/${id}/`, {
        name: data.name,
        title: data.title,
        pie_title: data.pie_title
      });
    }

    function copyBudget(id) {
      return $http.post(PREFIX + `budget/budgets/${id}/copy/`, {})
    }

    function deleteBudget(id) {
      return $http.delete(PREFIX + `budget/budgets/${id}/`)
    }

    function createItem(data) {
      return $http.post(PREFIX + `budget/category_items/`, data)
    }

    function updateItem(id, data) {
      return $http.put(`${PREFIX}budget/category_items/${id}/`, data);
    }

    function deleteItem(id) {
      return $http.delete(`${PREFIX}budget/category_items/${id}/`) 
    }

    function itemUp(id) {
      return $http.post(PREFIX + `budget/category_items/${id}/move_up/`)
    }
    function itemDown(id) {
      return $http.post(PREFIX + `budget/category_items/${id}/move_down/`) 
    }

    function createCategory(data) {
      return $http.post(PREFIX + `budget/categories/`, data)
    }

    function updateCategory(id, data) {
      return $http.put(`${PREFIX}budget/categories/${id}/`, data);
    }

    function deleteCategory(id) {
      return $http.delete(`${PREFIX}budget/categories/${id}/`) 
    }
    /** annualIncome */
    function createAnnualIncome(data) {
      return $http.post(PREFIX + `budget/annual_incomes/`, data)
    }
    function updateAnnualIncome(id, data) {
      return $http.put(`${PREFIX}budget/annual_incomes/${id}/`, data);
    }
    function deleteAnnualIncome(id) {
      return $http.delete(`${PREFIX}budget/annual_incomes/${id}/`) 
    }
    function annualIncomeUp(id) {
      return $http.post(PREFIX + `budget/annual_incomes/${id}/move_up/`)
    }
    function annualIncomeDown(id) {
      return $http.post(PREFIX + `budget/annual_incomes/${id}/move_down/`) 
    }
    /** NetAsset */
    function createNetAsset(data) {
      return $http.post(PREFIX + `budget/netassets/`, data)
    }
    function updateNetAsset(id, data) {
      return $http.put(`${PREFIX}budget/netassets/${id}/`, data);
    }
    function deleteNetAsset(id) {
      return $http.delete(`${PREFIX}budget/netassets/${id}/`) 
    }
    function netAssetUp(id) {
      return $http.post(PREFIX + `budget/netassets/${id}/move_up/`)
    }
    function netAssetDown(id) {
      return $http.post(PREFIX + `budget/netassets/${id}/move_down/`) 
    }
    /** Liability */
    function createLiability(data) {
      return $http.post(PREFIX + `budget/liabilities/`, data)
    }
    function updateLiability(id, data) {
      return $http.put(`${PREFIX}budget/liabilities/${id}/`, data);
    }
    function deleteLiability(id) {
      return $http.delete(`${PREFIX}budget/liabilities/${id}/`) 
    }
    function liabilityUp(id) {
      return $http.post(PREFIX + `budget/liabilities/${id}/move_up/`)
    }
    function liabilityDown(id) {
      return $http.post(PREFIX + `budget/liabilities/${id}/move_down/`) 
    }
    /** Auth */
    function checkToken() {
      var t = localStorage.getItem('t');
      if (t) {
        TOKEN = t;
        $http.defaults.headers.common.Authorization = `JWT ${t}`;
        return true;
      }
      return false;
    }

    /** Register API */
    function register(user) {
      return $http.post(`${PREFIX}user/register/`, user)
    }

    /** forgot password */
    function forgot(user) {
      return $http.post(PREFIX + "djoser/users/reset_password/", user)
        .then((response)=>{
          return response;
        })
      // return $http.post(`${PREFIX}djoser/users/reset_password/`, user)
      
    }

    function activate(user) {
      return $http.post(`${PREFIX}djoser/users/activation/`, user)
    }

    function reset(user) {
      return $http.post(`${PREFIX}djoser/users/reset_password_confirm/`, user)
    }

    return {
      login, //login: login
      logout,
      getProfile,
      getBudgets,
      updateBudget,
      createCategory,
      updateCategory,
      deleteCategory,
      createItem,
      updateItem,
      deleteItem,
      itemUp,
      itemDown,
      checkToken,
      copyBudget,
      deleteBudget,
      register,
      forgot,
      activate,
      reset,

      // annualincome
      createAnnualIncome,
      updateAnnualIncome,
      deleteAnnualIncome,
      annualIncomeUp,
      annualIncomeDown,
      // netasset
      createNetAsset,
      updateNetAsset,
      deleteNetAsset,
      netAssetUp,
      netAssetDown,
      //liability
      createLiability,
      updateLiability,
      deleteLiability,
      liabilityDown,
      liabilityUp
    }

  }]);