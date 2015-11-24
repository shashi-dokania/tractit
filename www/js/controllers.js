angular.module('starter.controllers', ['ngOpenFB'])

.controller('AppCtrl', function ($scope, $location, $ionicModal, $timeout, ngFB) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // data from facebook
  $scope.fbData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // // Perform the login action when the user submits the login form
  // $scope.doLogin = function() {
  //   console.log('Doing login', $scope.loginData);

  //   // Simulate a login delay. Remove this and replace with your login
  //   // code if using a login system
  //   $timeout(function() {
  //     $scope.closeLogin();
  //   }, 1000);
  // };

  $scope.fbLogin = function () {
    ngFB.login({scope: 'email, user_friends'})
    .then(function (response) {
      if (response.status === 'connected') {
        angular.extend($scope.fbData, response);
        console.log($scope.fbData.status);
        console.log('Facebook login succeeded');
        $scope.closeLogin();
        
        ngFB.api({path: '/me'})
        .then(function (response) {
          console.log(response);
          angular.extend($scope.fbData, response);
        }, function (error) {
          console.log(error);
        });

        ngFB.api({path: '/me/friends'})
        .then(function (response) {
          console.log(response);
          angular.extend($scope.fbData, response);
        }, function (error) {
          console.log(error);
        });

        ngFB.api({
          path: '/me/picture', 
          params: {redirect: false, height:50, width: 50}
        })
        .then(function (response) {
          angular.extend($scope.fbData, {picture: response.data.url});
          //ClientHelper.getFBdata($scope.me);
          console.log($scope.fbData.picture);
        })
        .then(function() {
          console.log("in location after login");
          $location.path('/app/events'); // '/map'
        }, function (error) {
          console.log(error);
        });
      } 
        else {
          alert('Facebook login failed');
        }
    });
  };

  $scope.eventHandler = function () {
    console.log('inside eventHandler...');
    if ( $scope.fbData.status === undefined ) {
      console.log('reached PlaylistsCtrl @96');
      alert('you are not signed in!');
      $location.path('/app/home');
    } else {
      $location.path('/app/events');
    }
  };

  $scope.logout = function () {
    ngFB.logout()
    .then(function (response) {
      $scope.fbData = {};
      $location.path('/app/home');
    });
  };

  $ionicModal.fromTemplateUrl('templates/createEvent.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.createEventModal = modal;
  });

  $scope.closeEventModal = function() {
    $scope.createEventModal.hide();
  };

})

.controller('EventsCtrl', function ($scope, $location) {
  $scope.events = [
    { title: 'Reggae', id: 1, description: 'Thanksgiving', date: '11/27/2015', time: '7:00 p.m - 10:00 p.m' },
    { title: 'Chill', id: 2, description: 'Thanksgiving', date: '11/27/2015', time: '7:00 p.m - 10:00 p.m' },
    { title: 'Dubstep', id: 3, description: 'Thanksgiving', date: '11/27/2015', time: '7:00 p.m - 10:00 p.m' },
    { title: 'Indie', id: 4, description: 'Thanksgiving', date: '11/27/2015', time: '7:00 p.m - 10:00 p.m' },
    { title: 'Rap', id: 5, description: 'Thanksgiving', date: '11/27/2015', time: '7:00 p.m - 10:00 p.m' },
    { title: 'Cowbell', id: 6, description: 'Thanksgiving', date: '11/27/2015', time: '7:00 p.m - 10:00 p.m' }
  ];
})

.controller('PlaylistCtrl', function ($scope, $location, $stateParams) {

  // $ionicModal.fromTemplateUrl('templates/createEvent.html', {
  //   scope: $scope
  // }).then(function(modal) {
  //   $scope.createEventModal = modal;
  //});

  $scope.addUser = function (list) {
    User.addUser($scope.user)
    .then(function () {
      $location.path('/app/events');
    }, function (error) {
      console.log(error);
    })
    
  };
});
