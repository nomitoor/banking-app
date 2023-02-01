
const path = require('path')
const TerserPlugin = require("terser-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
  mode: 'production',
  entry: {
    "app.min.js": [
      "./js/app.js",
      './js/stock/stock.filter.js',
      './js/stock/display.filter.js',

      './js/chart.service.js',
      './js/api.service.js',
      './js/common/permission.service.js',
      './js/debt-api.service.js',
      './js/notify.service.js',
      './js/stock/stock.service.js',
      './js/stock/yahoo.service.js',
      './js/modal/confirm.service.js',
      './js/notification/toast.service.js',
      './js/stock/stockParser.service.js',
      './js/stocks/databank.service.js',
      './js/stocks/screener.service.js',
      './js/stocks/watchlist.service.js',
      './js/stocks/stocklist.service.js',
      './js/dividend/dividend.service.js',
      './js/common/anchor.service.js',
      './js/common/broadcast.service.js',
      './js/modal/buyStock.service.js',
      './js/modal/sellStock.service.js',
      './js/stocks/portfolio.service.js',
      
      './js/budget.directive.js',
      './js/debt.directive.js',
      './js/category.directive.js',
      './js/debtCategory.directive.js',
      './js/autoFocus.directive.js',
      './js/modal/confirm.directive.js',
      './js/notification/toast.directive.js',
      './js/common/yearSelector.directive.js',
      './js/common/ddDatabank.directive.js',
      './js/common/ddScreener.directive.js',
      './js/common/paging.directive.js',
      './js/common/ddStock.directive.js',
      './js/common/csvDownload.directive.js',
      './js/common/ddStocklist.directive.js',
      './js/modal/stocklistModal.directive.js',
      './js/modal/buyStock.directive.js',
      './js/modal/sellStock.directive.js',
      './js/common/ddPortfolio.directive.js',
      './js/budget/annualIncome.directive.js',
      './js/budget/netasset.directive.js',
      './js/budget/liability.directive.js',
      './js/main.controller.js',
      './js/budget.controller.js',
      './js/debt.controller.js',
      './js/login.controller.js',
      './js/register.controller.js',
      './js/forgot.controller.js',
      './js/activate.controller.js',
      './js/reset.controller.js',
      './js/stock/stock.controller.js',
      './js/stock/intrinsic.controller.js',
      './js/common/root.controller.js',
      './js/dividend/dividendCalculator.controller.js',
      './js/dividend/dividendSummary.controller.js',
      './js/dividend/dividendCalculatorAdd.controller.js',
      './js/stocks/screener.controller.js',
      './js/stocks/databank.controller.js',
      './js/stocks/watchlist.controller.js',
      './js/portfolio/portfolio.controller.js',

      // bank
      './js/bank/bank.service.js',
      './js/bank/bank.controller.js',
      './js/bank/bank.directive.js',
      './js/bank/bankExpenseCategory.directive.js'
    ],
    "lib.min.js": [
      "./libs/angular.min.js",
      './libs/lodash.min.js',
      './libs/angular-route.min.js',
      './libs/angular-sanitize.min.js',
      './libs/ui-bootstrap-tpls-2.5.0.min.js',
      './libs/print.min.js',
      './libs/select.min.js',
      './libs/date.format.js'
    ],
    "app.min":[
      './libs/bootstrap.min.css',
      './libs/select.min.css',
      './libs/ui-select.bootstrap4.shim.css',
      './css/app.css'
    ]
  },

  output: {
      filename: "[name]",
      path: path.resolve(__dirname, 'dist')
  },
  resolve: {
      extensions: [".webpack.js", ".js"]
  },
  module: {
    rules: [{
      test: /\.mp3$/,
      use: "file-loader"
    },{
      test: /\.css$/i,
      use: [MiniCssExtractPlugin.loader, "css-loader"],
    },{
      test: /\.js$/,
      loader: 'string-replace-loader',
      options: {
        search: 'http://localhost:8000/api/v1/',
        replace: 'https://shinesbudget.com/api/v1/',
        flags: 'g'
      }
    }]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      test: /\.js$/i,
    })],
    splitChunks: {
      cacheGroups: {
        styles: {
          type: 'css/mini-extract',
        },
      },
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "img", to: "img" },
        { from: "views", to: "views" },
        // { from: "css", to: "css" }
      ],
    }),
    new MiniCssExtractPlugin({
    })
  ]
  
};