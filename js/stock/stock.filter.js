(function () {
  'use strict';

  function numberFormat(num, roundTo, prefix) {
    let numStr = num.toLocaleString(undefined, {minimumFractionDigits: roundTo, maximumFractionDigits: roundTo});
    if (prefix) {
      numStr = prefix + numStr
    }
    return numStr;
  }

  angular.module("fm")
    .filter('stockformat', ['$filter', function ($filter) {
      return function (input, options) {
        if (typeof input =='undefined'|| Number.isNaN(input) || input===null) {
          return '';
        }
        
        if(input==='N/A') {
          return input;
        }
        
        if (options.unit==='%' && _.isNumber(input)) {
          return `${numberFormat(input, options.round||2)}%`; 
        }
        
        if (options.unit==='market') {
          let amount = Math.abs(input);
          if (amount>=1000000000) {
            return `${numberFormat(input/1000000000)}B`
          }else if(amount>1000000) {
            return `${numberFormat(input/1000000)}M`
          }else{
            return numberFormat(input);
          }
        }
        if (options.dateFormat) {
          let t = input;
          if(!_.isDate(input)) {
            t = moment(input).toDate()
          }
          if (_.isDate(t)) { 
            return t.format(options.dateFormat);
          }
          return t;
        }
        if (typeof input === 'number') {
          let _round = 2;
          if(typeof options.round !='undefined') _round=options.round;
          return numberFormat(input, _round);
        }else if(typeof input === 'string' && options.splitBy){
          return input.split(options.splitBy)[0];
        }
        return input;
        // return $filter('number')(input * 100, decimals) + '%';
      };
    }])
    
})();