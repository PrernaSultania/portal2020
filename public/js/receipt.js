const app = angular.module("homeApp", []);
  app.controller("eventCtrl", function($scope, $http) {
    $scope.details=[];
    
      $scope.initialize = function(data) {
      data = JSON.parse(JSON.stringify(data));
      console.log(data);
      $scope.payment=data[0].payment;
      var i;
      var j;
      var k;
      $scope.details=[];
        var x;
      for(i=0; i < data.length ; i++)
      {
        let detail = {};
        detail.id = data[i].payment.transactionId;
        detail.name=[];
        detail.fee = 0;
        detail.paidbool=data[i].payment.paid;
        if(detail.paidbool)
        detail.type = data[i].payment.type;
        else
        detail.type = "--";
        if(detail.paidbool == true)
        detail.paid = "Paid";
        else
        detail.paid = "Failed";

        if(detail.paid=="Paid")
        {
          if(data[i].payment.dtxndate)
          detail.date = data[i].payment.dtxndate;
          else
          detail.date = data[i].payment.online.transactionDate;
        }
        else
        detail.date = data[i].payment.dtxndate;

        for(j=0; j< data[i].eventIds.length ;j++ )
        {
          
          detail.name.push(data[i].eventIds[j].name);
          
        }
        detail.fee = data[i].payment.amount;
      
        $scope.details.push(detail);
      }

      };
      
      console.log($scope.details);
  });