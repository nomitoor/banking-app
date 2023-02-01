(function () {
  'use strict';

  angular
    .module('fm')
    .directive('csvDownload', csvDownload);

  csvDownload.$inject = [];
  function csvDownload() {
    return {
      restrict: 'A',
      scope: {
        containerId: '@',
        filename: '@'
      },
      link: function (scope, element, attrs) {
        var el = element[0];
        function textProcess(node) {
          if(node.hasAttribute('no-export')) return ''
          return node.innerText.replace(/\$/g,'').replace(/\,/g,'') 
        }

        element.bind('click', function(e){
          var tables = document.querySelectorAll(`#${scope.containerId} table`)
          var csvString = '';
          for(let table of tables) {
            for(var i=0; i<table.rows.length;i++){
              var rowData = table.rows[i].cells;
              for(var j=0; j<rowData.length;j++){
                csvString = csvString + textProcess(rowData[j]) + ",";
              }
              csvString = csvString.substring(0,csvString.length - 1);
              csvString = csvString + "\n";
            }
            csvString = csvString + "\n\n";
          }
          csvString = csvString.substring(0, csvString.length - 1);
          var a = document.createElement('a')
          a.style.display = 'none'
          a.href = 'data:application/octet-stream;base64,' + btoa(csvString)
          a.download = scope.filename
          document.getElementsByTagName('body')[0].appendChild(a);
          a.click()
          a.remove();
        });
      }
    }
  }

})()
