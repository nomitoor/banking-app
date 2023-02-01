angular.module('fm')
  .factory('BankService', ['$rootScope', '$http', 'AppConfig',
  function($rootScope, $http, AppConfig) {
    var PREFIX = AppConfig.API_PREFIX;
    
    /** Banks */
    function getBanks() {
      return $http.get(PREFIX + `bank/banks/`)
    }
    function getBank(id) {
      return $http.get(PREFIX + `bank/banks/${id}/`)
    }
    function createBank(data) {
      return $http.post(PREFIX + `bank/banks/`, data) 
    }
    function updateBank(id, data) {
      return $http.put(PREFIX + `bank/banks/${id}/`, data) 
    }
    function deleteBank(id) {
      return $http.delete(PREFIX + `bank/banks/${id}/`) 
    }
    /** Income Item */
    function createIncomeItem(data) {
      return $http.post(PREFIX + `bank/income_items/`, data) 
    }
    function updateIncomeItem(id, data) {
      return $http.put(PREFIX + `bank/income_items/${id}/`, data) 
    }
    function deleteIncomeItem(id) {
      return $http.delete(PREFIX + `bank/income_items/${id}/`) 
    }
    function incomeItemUp(id) {
      return $http.post(PREFIX + `bank/income_items/${id}/move_up/`)
    }
    function incomeItemDown(id) {
      return $http.post(PREFIX + `bank/income_items/${id}/move_down/`)
    }
    /** Expense Category */
    function deleteExpenseCategory(id) {
      return $http.delete(PREFIX + `bank/expense_categories/${id}/`) 
    }
    function createExpenseCategory(data) {
      return $http.post(PREFIX + `bank/expense_categories/`, data) 
    }
    function updateExpenseCategory(id, data) {
      return $http.put(PREFIX + `bank/expense_categories/${id}/`, data) 
    }

    // expense items
    function deleteExpenseItem(id) {
      return $http.delete(PREFIX + `bank/expense_items/${id}/`)  
    }
    function createExpenseItem(data) {
      return $http.post(PREFIX + `bank/expense_items/`, data) 
    }
    function updateExpenseItem(id, data) {
      return $http.put(PREFIX + `bank/expense_items/${id}/`, data)
    }
    function expenseItemUp(id) {
      return $http.post(PREFIX + `bank/expense_items/${id}/move_up/`)
    }
    function expenseItemDown(id) {
      return $http.post(PREFIX + `bank/expense_items/${id}/move_down/`)
    }
    return {
      // bank
      getBanks,
      getBank,
      createBank,
      updateBank,
      deleteBank,
      // income items
      deleteIncomeItem,
      createIncomeItem,
      updateIncomeItem,
      incomeItemUp,
      incomeItemDown,
      // expense category
      deleteExpenseCategory,
      createExpenseCategory,
      updateExpenseCategory,
      // expense items
      deleteExpenseItem,
      createExpenseItem,
      updateExpenseItem,
      expenseItemUp,
      expenseItemDown

    }

  }]);