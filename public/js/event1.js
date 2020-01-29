// eventcontroller
const app = angular.module("homeApp", []);
app.controller("eventCtrl", function($scope, $http) {

  $scope.initialize = function(data) {
    data = JSON.parse(JSON.stringify(data));
    $scope.data = data;
    console.log(data);
    $scope.register();
  };


  $scope.register = function() {
    $scope.working = true;
    $http({
      url: "/user/register-event",
      method: "POST",
      data: { eventIds: $scope.data }
    }).then(function(response) {
      response = JSON.parse(JSON.stringify(response));
      console.log(response.data.receiptStatus);
      $scope.data = response.data;
      $scope.message = $scope.data.message;
      console.log("yayyy");
      if ($scope.message != "ok") {
        swal({
          title: "OOPS",
          text: $scope.message,
          type: "error",
          icon: "error",
          buttons: {
            ok: {
              text: "ok",
              value: "ok"
            }
          }
        }).then(value => {
          if (value == "ok") {
            window.location.href = "/user/eventswebview";
          }
        });
      } else {
        swal({
          title: "Alert",
          text: "Do you wish to Pay now?",
          buttons: {
            cancel:{
              text: "Cancel",
              value:"Cancel"
            },
            ok: {
              text: "OK",
              value: "ok"
            }
          }
        }).then(value => {
          if (value == "ok") {
            
            $scope.pay();
          }
          else if(value=="Cancel"){
            window.location.href = "/user/eventswebview";
          }
        });
      }
      $scope.working = false;
    });
  };

  $scope.pay = function() {
    document.forms["paymentForm"]["regId"].value = $scope.data.receiptID;
    document.forms["paymentForm"].submit();
  };

});
