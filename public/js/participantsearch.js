const app = angular.module("homeApp", []);
app.controller("myCtrl", function($scope, $http) {
  $scope.initialize = function(data) {
    $scope.checkIn = 0;
    $scope.checkOut = 0;
    $scope.damage = "yes";
    $scope.mode = "offline";
    $scope.work = false;
    data = JSON.parse(JSON.stringify(data));
    $scope.data = data;
  };
  $scope.ini = function(message) {
    message = JSON.parse(JSON.stringify(message));
    $scope.message = message;
    if($scope.message!="")
    {
      swal({
        title: "ERROR",
        text: "There are no Receipts",
        type: "error",
        icon: "error",
        buttons: {
          ok: {
            text: "Ok",
            value: "ok"
          }
        }
      }).then(value => {
        if (value == "ok") {
          window.location.href = "/admin/gc";
        }
      });
    }
  };

  $scope.visible = function() {
    $scope.clicked = true;
    $scope.show = true;
  };

  $scope.test = function() {
    if ($scope.clicked != true) $scope.show = false;
  };

  $scope.invisible = function() {
    $scope.clicked = false;
    $scope.show = false;
  };
  $scope.info = function(x) {
    $scope.clicked = false;
    $scope.show = false;
    $scope.userId = x._id;
    $http.post("/admin/search", { data: x._id }).then(function(message) {
      message = JSON.parse(JSON.stringify(message));
      $scope.message = message;
      $scope.work = true;
      // console.log("sdjhfvfwejhbwjfb");
      console.log($scope.message.data);

      $scope.gender = $scope.message.data.gender;
    });
  };

  // GC
  $scope.online = function() {
    if ($scope.mode == "offline") $scope.mode = "online";

    // console.log($scope.mode);
  };

  $scope.offline = function() {
    if ($scope.mode == "online") $scope.mode = "offline";

    // console.log($scope.mode);
  };

  $scope.damag = function() {
    if ($scope.damage == "no") $scope.damage = "yes";

    // console.log($scope.damage);
    $scope.submit2 = true;
  };

  $scope.nodamage = function() {
    if ($scope.damage == "yes") $scope.damage = "no";

    // console.log($scope.damage);
    $scope.submit2 = true;
  };

  $scope.calculate = function(from, to, transactionId, boxId) {
    $scope.from = from;
    $scope.to = to;
    // console.log($scope.to);
    // console.log($scope.from);
    $scope.checkInDay = new Date($scope.from).getDate();
    $scope.checkOutDay = new Date($scope.to).getDate();

    if ($scope.checkOutDay - $scope.checkInDay > 0) {
      // console.log("sdhfvskjfhds");
      // console.log($scope.gender);
      $scope.defaultAmt = $scope.gender === "male" ? 315 : 275;
      $scope.total =
        ($scope.checkOutDay - $scope.checkInDay) * $scope.defaultAmt;
    } else {
      swal({
        title: "IDIOT",
        text: "Stop working like a Donkeyyy! Choose the dates correctly.",
        type: "error",
        icon: "error",
        buttons: {
          ok: {
            text: "Press Sorry",
            value: "ok"
          }
        }
      }).then(value => {
        if (value == "ok") {
          window.location.href = "/admin/gc";
        }
      });
    }
  };

  $scope.entry = function(transactionId, boxId) {
    $scope.transactionId = transactionId;
    if (!transactionId) {
      transactionId = "";
    }
    var m= $scope.from.toString();
    var  n= $scope.to.toString();
    $scope.boxId = boxId;
    console.log(boxId);
    var data = {
      userId: $scope.userId,
      mode: $scope.mode,
      // checkIn: $scope.from,
      // checkOut: $scope.to,
      checkOut: n,
      checkIn: m,
      amountPaid: $scope.total,
      transactionId: transactionId,
      boxId: boxId
    };
    console.log(data);
    $http.post("/admin/gc/checkin", { data: data }).then(function(response) {
      console.log(response.data.message);
      if (response.data.message == "ok") {
        swal({
          title: "Success",
          text: "Receipt Generated",
          type: "success",
          icon: "success",
          buttons: {
            ok: {
              text: "Ok",
              value: "ok"
            }
          }
        }).then(value => {
          if (value == "ok") {
            var url = `/admin/gc/receipt/${$scope.userId}`;
            window.location.href = url;
          }
        });
      }
    });
  };

  $scope.exit = function() {
    var data = {
      userId: $scope.userId,
      damage: $scope.damage
    };
    $http.post("/admin/gc/checkout", { data: data }).then(function(response) {
      console.log(response.message);
    });
  };

  $scope.redir = function() {
    var url = `/admin/gc/receipt/${$scope.userId}`;
    window.location.href = url;
  };
});
