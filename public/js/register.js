const app = angular.module('myApp', []);
app.controller('formCtrl', function ($scope) {
    $scope.vit = false;
    $scope.pwdVal = false;
    $scope.scope = "external";
    $scope.room = ' ';
    $scope.registration = ' ';
    $scope.section = ' ';
    $scope.memNo = ' ';
    $scope.uniCheck = function (val) {
        if (val) {
            $scope.uni = "VIT Vellore";
            $scope.scope = "internal";
        } else {
            $scope.scope = "external";
            $scope.uni = "";
            $scope.room = "";
            $scope.reg = "";
        }
    }
    $scope.ieeeCheck = function (val) {
        if (!val) {
            $scope.memNo = "";
            $scope.section = "";
        }
    }
    $scope.changeCase = function(){
        $scope.reg = $scope.reg.toUpperCase();
    }
    $scope.pwdCheck = function () {
        if ($scope.pwd === $scope.conPwd && $scope.pwd.length > 0 && $scope.conPwd.length > 0) {
            $scope.pwdVal = true;
            $scope.message = "Passwords match";
        } else {
            $scope.pwdVal = false;
            $scope.message = "Passwords do not match";
        }
    }



});