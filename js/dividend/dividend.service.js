angular.module('fm')
  .factory('DividendService', ['$rootScope', function($rootScope) {
    
    function getNumberOfDividendPerYear(stockData) {
      let mapping = {
        'monthly': 12,
        'quarterly': 4,
        'annually': 1,
        'semi-annually':2,
        'growth': 0
      }
      return mapping[("" + stockData.dividendFrequency).toLowerCase()] || stockData.dividendFrequency;
    }
    function getDividendShort(stockData){
      let mapping = {
        'monthly': 'M',
        'quarterly': 'Q',
        'annually': '',
        'semi-annually': 'S',
        'growth': '',
        '3': '#',
        '5': '#',
        '6': '#',
        '7': '#',
        '8': '#',
        '9': '#',
        '10': '#',
        '11': '#'
      }
      return mapping[("" + stockData.dividendFrequency).toLowerCase()] || '';
    }
    function getInitDividend(_stockData, _inputData) {
      let init = {
        numberOfShare: _stockData.numberOfShare || 0,
        investmentCash: (_stockData.numberOfShare *  _stockData.currentStockPrice) + _inputData.commission,
        investmentCashDrip: (_stockData.numberOfShare *  _stockData.currentStockPrice) + _inputData.commission,
        cashBalance: _inputData.balance - ((_stockData.numberOfShare *  _stockData.currentStockPrice) + _inputData.commission), //+ _.round(_inputData.init_amount -_inputData.commission - (_stockData.numberOfShare * _stockData.currentStockPrice), 2),
        year: 1,
        newYear: true,
        endYear: false,
        title: `Year 1`,
        dripShare: 0,
        yearEarning: 0,
        yearEarningDrip: 0,
        dripShareInYear: 0,
        profit: 0,
        profitDrip: 0,
        upToNowEarning: 0,
        upToNowEarningDrip: 0,
        currentStockPrice: _stockData.currentStockPrice
      }
      init.cashBalance = _inputData.init_amount - init.investmentCash
      // new request, average cost
      init.averageCost = init.investmentCash / init.numberOfShare;
      return init
    }
    function estimateDividend(_stockData, _inputData) { 
      let dividends = [];
      let initial = getInitDividend(_stockData, _inputData)
      // dividends.push(initial)

      // let _div0 = {
      //   availableForInvenstment: _inputData.init_amount-_inputData.commission,
      //   investmentCash: _stockData.numberOfShare * _stockData.currentStockPrice,
      //   investmentCashDrip: _stockData.numberOfShare * _stockData.currentStockPrice,
      //   numberOfShare: _stockData.numberOfShare || 0,
      //   dividendCash: 0,
      //   dripShare: 0,
      //   sharePecentageCash: 0,
      //   dripShareInYear: 0,
      //   yearEarning: 0,
      //   yearEarningDrip: 0,
      //   profit: 0,
      //   profitDrip: 0
      // }
      // _div0.sharePecentageCash = _.round(100*((_div0.availableForInvenstment%_stockData.currentStockPrice)/_stockData.currentStockPrice),2)
      // let remainCash = _div0.availableForInvenstment - _div0.investmentCash;
      let numberOfDividends = getNumberOfDividendPerYear(_stockData)
      let dividendShort = getDividendShort(_stockData)
      
      for(let i=1;i<_inputData.year*numberOfDividends;i++) {
        let year = Math.floor(i/numberOfDividends) + 1;
        let previous = i==1?initial:dividends[i-2]
        
        let _dividendCash = _stockData.numberOfShare * _stockData.dividendsPerShare;
        let _dividendCashDrip = previous.numberOfShare * _stockData.dividendsPerShare;
        let _dripShare = Math.floor(_dividendCashDrip / _stockData.currentStockPrice);
        let _numberOfShare = previous.numberOfShare + _dripShare;
        

        let thisDividend = {
          dividendCash: _dividendCash,
          dripShare: _dripShare,
          numberOfShare: _numberOfShare,
          investmentCash: previous.investmentCash + _dividendCash,
          investmentCashDrip: 0,//_numberOfShare*_stockData.currentStockPrice,
          sharePecentageCash: _.round(100*((_dividendCash%_stockData.currentStockPrice)/_stockData.currentStockPrice),2),
          cashBalance: previous.cashBalance + ((_dividendCash/_stockData.currentStockPrice)-_dripShare)*_stockData.currentStockPrice,
          dividendCashDrip: 0,
          year: year,
          newYear: false,
          endYear: false,
          title: `Year ${year}`
        }
        thisDividend.dripShareInYear = previous.dripShareInYear + thisDividend.dripShare;
        thisDividend.dividendCashDrip = (((previous.numberOfShare * _stockData.dividendsPerShare)/_stockData.currentStockPrice)-_dripShare)*_stockData.currentStockPrice;
        thisDividend.cashDripReceive = _.round(thisDividend.dripShare * _stockData.currentStockPrice, 2)
        thisDividend.investmentCashDrip = thisDividend.cashDripReceive + previous.investmentCashDrip + thisDividend.dividendCashDrip
        if(dividendShort!="") {
          thisDividend.title += ` - ${dividendShort}${(i%numberOfDividends)+1}`  
        }
        thisDividend.dividendShort = `Year ${thisDividend.year} - ${dividendShort}${(i%numberOfDividends)+1}`;
        thisDividend.yearEarning = previous.yearEarning + thisDividend.dividendCash
        thisDividend.yearEarningDrip = previous.yearEarningDrip + thisDividend.dividendCashDrip
        // earning upto now
        thisDividend.upToNowEarning = previous.upToNowEarning + thisDividend.dividendCash
        thisDividend.upToNowEarningDrip = previous.upToNowEarningDrip + thisDividend.dividendCashDrip

        thisDividend.profit = 100*(thisDividend.investmentCash - initial.investmentCash)/initial.investmentCash
        thisDividend.profitDrip = 100*(thisDividend.investmentCashDrip - initial.investmentCash)/initial.investmentCash
        if(i>0 && year>previous.year) {
          thisDividend.newYear = true;
          previous.endYear = true;
          thisDividend.dripShareInYear = thisDividend.dripShare;
          thisDividend.yearEarning =  thisDividend.dividendCash
          thisDividend.yearEarningDrip = thisDividend.dividendCashDrip 
        }
        // console.log(thisDividend)
        dividends.push(thisDividend)
      }
      dividends[dividends.length-1].endYear = true
      return dividends;
    }

    function transformDividendsPerShare(stock) {
      
      switch (stock.dividendFrequency.toLowerCase()) {
        case 'monthly':
          stock.dividendsPerShare = stock.dividendsPerShare / 12;
          // stock.dividendYield = stock.dividendYield / 12;
          break;
        case 'quarterly':
          stock.dividendsPerShare = stock.dividendsPerShare / 4;
          // stock.dividendYield = stock.dividendYield / 4;
          break;
        case 'annually':
          break;
        case 'semi-annually':
          stock.dividendsPerShare = stock.dividendsPerShare / 2;
          // stock.dividendYield = stock.dividendYield / 2;
          break;
        default:
          try{
            const _d = parseInt(stock.dividendFrequency)
            if(isNaN(_d)||_d===0) {
              stock.dividendsPerShare = stock.dividendsPerShare
            }else {
              stock.dividendsPerShare = stock.dividendsPerShare / _d
            }
          }catch(e) {
            
          }
      }
      if (stock.dividendsPerShare) {
        stock.dividendsPerShare = stock.dividendsPerShare.toFixed(3)
      }
      return stock;
    }
    
    function generateYears(max, step) {
      max = max || 40;
      step = step || 1;
      let res = [1];
      for (let i=step;i<=max;i=i+step) {
        if(i===1) continue;
        res.push(i);
      }
      console.log(res)
      return res;
    }

    return {
      estimateDividend,
      getInitDividend,
      transformDividendsPerShare,
      generateYears
    }

  }]);