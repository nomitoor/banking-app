(function () {
  'use strict';


  angular.module("fm")
    .filter('displayformat', ['$filter', function ($filter) {
      return function (input, format, value) {
        if (typeof input === 'undefined') {
          return 'N/A';
        }
        if (!format || input=='N/A') {
          return input;
        }
        let _cl = '';
        if (typeof format ==='string') {
          switch(format) {
            case 'colorZero':
              if (value<0) {
                _cl = 'text-danger';
              }else if(value==0){
                _cl = 'text-warning';
              }else{
                _cl = 'text-success';
              }
              break;
            case 'buySale':
              if(value=='BUY') {
                _cl = 'bg-success text-white';
                input = 'BUY';
              }else{
                _cl = 'bg-danger text-white';
                input = 'SALE';
              }
              break;
            case 'fixed':
              _cl = 'text-success'
              break;
            
          }
        }else if (typeof format==='function') {
          _cl = format.call(undefined, input, value)
        }
        
        return `<div class="${_cl}">${input}</div>`;
      };
    }])
})();