angular.module('fm')
  .factory('NotifyService', function() {

    function show(data) {
      Notification.requestPermission().then(function(result) {
        //ok, can show 
        var notification = new Notification(data);
        notification.onclick = function() {
          window.focus();
        }

      });
    }

    return {
      show // show: show
    }

  });