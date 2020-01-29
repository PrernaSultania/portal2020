const app = angular.module("myApp", []);
app.controller("gcRecCtrl", function ($scope, $http) {
  var originalUrl = window.location.href.split("/");
  var field = originalUrl[originalUrl.length - 1];
  $scope.total = 0;
  $scope.initialize = function(data) {
    
    $scope.i=1;
    $scope.data=data;
    console.log($scope.data);
    for(i=0;i<$scope.data.length;i++){
    if($scope.data[0].userId.gender=="male"){
      $scope.data[i].block="MH";
    }
    else
    $scope.data[i].block="LH";
  }

  JsBarcode("#barcode", data[0]._id);
  };

  $scope.calc = function(p)
  {
    var x = p.checkIn;
    var y = p.checkOut;
    $scope.checkInDay = new Date(x).getDate();
    $scope.checkOutDay = new Date(y).getDate();
    console.log($scope.checkOutDay-$scope.checkInDay)
    $scope.days=$scope.checkOutDay-$scope.checkInDay;
    p.days=$scope.days;
  };
});
