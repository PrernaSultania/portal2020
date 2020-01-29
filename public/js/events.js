// eventcontroller
const app = angular.module("homeApp", []);
app.controller("eventCtrl", function($scope, $http) {
  $scope.regEvents = [];
  $scope.paidEvents = [];
  $scope.blockedEvents = [];
  $scope.combo = [];
  $scope.whichCombo = "";
  $scope.regState = "Add To Cart";

  $scope.initialize = function(data) {
    data = JSON.parse(JSON.stringify(data));
    $scope.data = data;
    console.log(data);
    $scope.loading = true;
  };

  $scope.initialize1 = function(user) {
    user = JSON.parse(JSON.stringify(user));
    $scope.user = user;
    console.log(user);
    $scope.userScope="external";
    $scope.isIeee =
      user.ieeeSection != undefined &&
      user.ieeeSection != " " &&
      user.ieeeSection != "";
    if($scope.user.university=="VIT University"){
      $scope.userScope="internal";
      var i;
      for(i=0;i<$scope.data.length;i++){
        if($scope.data[i].eventScope=="external"){
          $scope.data.splice(i,1);
          i=i-1;
        }
      }
    }
    if(!$scope.isIeee){
      var i=0;
      for(i=0;i<$scope.data.length;i++){
        if($scope.data[i].name=="IEEE-Combo")
        {
          $scope.data.splice(i,1);
        }
      }
    }

    $scope.individualEvent=[];
    $scope.internalcomboEvent=[];
    $scope.externalcomboEvent=[];
    var j;
    for(j=0;j<$scope.data.length;j++){
      if($scope.data[j].comboOrNot == true)
      {
        if($scope.data[j].eventScope=="external")
        $scope.externalcomboEvent.push($scope.data[j]);
        else
        $scope.internalcomboEvent.push($scope.data[j]);
      }
      else
      $scope.individualEvent.push($scope.data[j]);
    }

    console.log($scope.data);
    console.log($scope.individualEvent);
    console.log($scope.internalcomboEvent);
    console.log($scope.externalcomboEvent);
  };

  $scope.isFull = function(_id) {
    var fullEvents = [];
    return fullEvents.indexOf(_id) != -1;
  };

  $scope.isRegular = function(event) {
    return event.type == "regular";
  };
  $scope.isEarly = function(event) {
    return event.type == "early";
  };
  $scope.isLate = function(event) {
    return event.type == "late";
  };

  $scope.select = function(event) {
    if (event.comboOrNot) {
      x = $scope.regEvents.indexOf(event._id);

      if (x == -1 && $scope.blockedEvents.lastIndexOf(event._id) == -1) {
        var i;
        if ($scope.whichCombo != "") {
          $scope.regEvents.splice(
            $scope.regEvents.indexOf($scope.whichCombo),
            1
          );
          $scope.whichCombo = "";
        }
        for (i = 0; i < event.comboEventIds.length; i++) {
          $scope.combo.push(event.comboEventIds[i]);
          if ($scope.regEvents.indexOf(event.comboEventIds[i]) != -1) {
            $scope.regEvents.splice(
              $scope.regEvents.indexOf(event.comboEventIds[i]),
              1
            );
          }
        }
        $scope.regEvents.push(event._id);
        $scope.whichCombo = event._id;
      } else if (x != -1 && $scope.blockedEvents.lastIndexOf(event._id) == -1) {
        $scope.combo = [];
        $scope.whichCombo = "";
        $scope.regEvents.splice(x, 1);
      }
    } else if (!event.comboOrNot) {
      let x = $scope.regEvents.indexOf(event._id);
      if (x == -1 && $scope.blockedEvents.lastIndexOf(event._id) == -1) {
        if ($scope.combo.lastIndexOf(event._id) != -1) {
          $scope.combo = [];
          $scope.regEvents.splice(
            $scope.regEvents.indexOf($scope.whichCombo),
            1
          );
        }
        $scope.regEvents.push(event._id);
      } else if (x != -1 && $scope.blockedEvents.lastIndexOf(event._id) == -1) {
        $scope.regEvents.splice(x, 1);
      }
    }

    $scope.total = 0;
    $scope.data.forEach(function(eventData) {
      if ($scope.regEvents.indexOf(eventData._id) != -1) {
        if (eventData.type == "regular")
          $scope.total += parseInt(eventData.feeDetail.regular);
        else if (eventData.type == "early")
          $scope.total += parseInt(eventData.feeDetail.early);
        else $scope.total += parseInt(eventData.feeDetail.late);
      }
    });
    $scope.loading = false;
  };

  $scope.working = false;
  $scope.register = function() {
    $scope.working = true;
    $http({
      url: "/user/register-event",
      method: "POST",
      data: { eventIds: $scope.regEvents }
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
            window.location.href = "/user/event";
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
            window.location.href = "/user/event";
          }
        });
      }
      $scope.working = false;
    });
  };
  $scope.registerOld = function() {
    $scope.working = true;
    $http
      .post("/events/register", { eventIds: $scope.regEvents })
      .then(function(response) {
        $scope.message = response.data;
        $scope.working = false;
        if (confirm("Do you wish to pay now?")) $scope.pay();
      });
  };

  $scope.pay = function() {
    document.forms["paymentForm"]["regId"].value = $scope.data.receiptID;
    document.forms["paymentForm"].submit();
  };
});
