const app = angular.module("homeApp", []);
  app.controller("eventCtrl", function($scope, $http) {
    $scope.details=[];
    
      $scope.initialize = function(data) {
      data = JSON.parse(JSON.stringify(data));
      // console.log(data);
      $scope.data = data;
      console.log($scope.data);
      for(i=0;i<$scope.data.length;i++)
      {
        $scope.data[i].added = $scope.data[i].registeredCount;
      
      }
      let comboId=["5c6ba4efed306f35c4c39bbf","5c6ba596ed306f35c4c39bc0","5c6ba6aced306f35c4c39bc1","5c6ba72aed306f35c4c39bc2","5c6ba7eced306f35c4c39bc3","5c6ba4caed306f35c4c39bbe"];
      $scope.comboId= comboId;
      $scope.details=[];
       let detail ={};
        detail.acombo1= ["Convoke'19","Machine Learning Workshop","Cloud Computing Workshop"];
        detail.acombo2= ["Convoke'19","Cyber-Security Workshop","Blockchain and Cryptocurrency Workshop"];
        detail.wcombo1= ["UI/UX Workshop","Cyber-Security Workshop","Machine Learning Workshop"];
        detail.wcombo2= ["UI/UX Workshop","Cyber-Security Workshop","Blockchain and Cryptocurrency Workshop"];
        detail.ieeecombo= ["Convoke'19","Machine Learning Workshop","UI/UX Workshop","Cyber-Security Workshop","Blockchain and Cryptocurrency Workshop","Cloud Computing Workshop"];
        
        $scope.details.push(detail);
        
      console.log($scope.details[0].acombo1);
      

        $scope.sums=[];
        let sum={};
        for(i=0; i < $scope.data.length ;i++)
        {
          if(comboId.indexOf($scope.data[i]._id)==-1)
          {
            if($scope.details[0].acombo1.indexOf($scope.data[i].name)!=-1)
            {
              for(j=0;j<$scope.data.length;j++)
              {
                if($scope.data[j].name=="ARCS Combo 1")
                h=j;
              }
              $scope.data[i].added = $scope.data[i].added + $scope.data[h].registeredCount; 
            }
            if($scope.details[0].acombo2.indexOf($scope.data[i].name)!=-1)
            {
              for(j=0;j<$scope.data.length;j++)
              {
                if($scope.data[j].name=="ARCS Combo 2")
                h=j;
              }
              $scope.data[i].added = $scope.data[i].added + $scope.data[h].registeredCount; 
            }
            if($scope.details[0].wcombo1.indexOf($scope.data[i].name)!=-1)
            {
              for(j=0;j<$scope.data.length;j++)
              {
                if($scope.data[j].name=="Workshop Combo 1")
                h=j;
              }
              $scope.data[i].added = $scope.data[i].added + $scope.data[h].registeredCount; 
            }
            if($scope.details[0].wcombo2.indexOf($scope.data[i].name)!=-1)
            {

              // console.log($scope.data[i].name);
              for(j=0;j<$scope.data.length;j++)
              {
                if($scope.data[j].name=="Workshop Combo 2")
                h=j;
              }
              $scope.data[i].added = $scope.data[i].added + $scope.data[h].registeredCount; 
            }
            if($scope.details[0].ieeecombo.indexOf($scope.data[i].name)!=-1)
            {

              console.log($scope.data[i].name);
              for(j=0;j<$scope.data.length;j++)
              {
                if($scope.data[j].name=="IEEE-Member Combo")
                h=j;
              }
              $scope.data[i].added = $scope.data[i].added + $scope.data[h].registeredCount; 
            } 
          }
        }
        // let dict= [{key:"a", value:"1"}];
        
      };

      $scope.add = function(x){
        
      };
     
      
  });