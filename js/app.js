(function () {
  'use strict';

  var app = angular.module("fm", [
    'ngRoute',
    'ui.select',
    'ui.bootstrap',
    'ngSanitize'    
  ])
  .config(['$routeProvider', '$httpProvider',
    function config($routeProvider, $httpProvider) {
      $routeProvider
        // .when('/', {
        //   template: "",
        //   controller: "MainController",
        //   controllerAs: 'vm',
        //   resolve: {
        //     profile: ['ApiService', function(ApiService) {
        //       return ApiService.getProfile()
        //     }
        //   ]}
        // })
        .when('/budgets', {
          templateUrl: 'views/v-budget.html?r=123&',
          controller: 'BudgetController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        .when('/gds-tds', {
          templateUrl: 'views/v-debt.html?r=123&',
          controller: 'DebtController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        .when('/stock-valuable', {
          templateUrl: 'views/v-stock.html?r=123&',
          controller: 'StockController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        .when('/intrinsic-value', {
          templateUrl: 'views/intrinsic-value.html?r=123&',
          controller: 'IntrinsicController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        // .when('/dividend-calculator', {
        //   templateUrl: 'views/dividend/dividend-calculator.html',
        //   controller: 'DividendCalculatorController',
        //   controllerAs: 'vm',
        //   resolve: {
        //     init: ['ApiService', function(ApiService) {
        //       return ApiService.getProfile();
        //     }]
        //   }
        // })
        .when('/dividend-calculator', {
          templateUrl: 'views/dividend/dividend-calculator-add.html?r=123&',
          controller: 'DividendCalculatorAddController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        .when('/dividend-summary', {
          templateUrl: 'views/dividend/dividend-summary.html?r=123&',
          controller: 'DividendSummaryController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        /** stocks */
        .when('/databank', {
          templateUrl: 'views/stocks/databank.html?r=123&',
          controller: 'DatabankController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        .when('/screener', {
          templateUrl: 'views/stocks/screener.html?r=123&',
          controller: 'ScreenerController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        .when('/watchlist', {
          templateUrl: 'views/stocks/watchlist.html?r=123&',
          controller: 'WatchlistController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        .when('/portfolios', {
          templateUrl: 'views/portfolio/index.html?r=123&',
          controller: 'PortfolioController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        .when('/banks', {
          templateUrl: 'views/bank/index.html?r=123&',
          controller: 'BankController',
          controllerAs: 'vm',
          resolve: {
            init: ['ApiService', function(ApiService) {
              return ApiService.getProfile();
            }]
          }
        })
        
        .when('/login', {
          templateUrl: 'views/login.html?r=123&',
          controller: 'LoginController',
          controllerAs: 'vm'
        })
        .when('/register', {
          templateUrl: 'views/register.html?r=123&',
          controller: 'RegisterController',
          controllerAs: 'vm'
        })
        .when('/forgot', {
          templateUrl: 'views/forgot.html?r=123&',
          controller: 'ForgotController',
          controllerAs: 'vm'
        })
        .when('/activate/:uid/:token', {
          templateUrl: 'views/activate.html?r=123&',
          controller: 'ActivateController',
          controllerAs: 'vm'
        })
        .when('/password/reset/confirm/:uid/:token', {
          templateUrl: 'views/reset.html?r=123&',
          controller: 'ResetController',
          controllerAs: 'vm'
        })
        .when('/403', {
          templateUrl: 'views/403.html?r=123&'
        })
        .when('/routing', {
          template: `<div></div>`,
          controller: 'RootController',
          controllerAs: 'vm'
        })
        .otherwise('/budgets');
      
      $httpProvider.defaults.withCredentials = false;
      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }])
    .run(['$rootScope', '$location', 'ApiService', function($rootScope, $location, ApiService) {
      let hasToken = ApiService.checkToken();
      // if (!hasToken) {
      //   $location.path('/login');
      //   return;
      // }
    }])
    .constant("AppConfig", (function() {
      return {
        API_PREFIX: 'http://localhost:8000/api/v1/'
      }
    })())
    

})();