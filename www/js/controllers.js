angular.module('starter.controllers', ['ngOpenFB', 'ngCordova'])

.controller('AppCtrl', function ($scope, $location, $interval, $ionicModal, $timeout, ngFB) {

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

  $scope.intervalFunc;

  $scope.fbLogin = function () {
    ngFB.login({scope: 'email, user_friends, user_location'})//, friends_location
    .then(function (response) {
      if (response.status === 'connected') {
        angular.extend($scope.fbData, response);
        
        console.log('Facebook login succeeded');
        $scope.closeLogin();
        
        ngFB.api({path: '/me'})
        .then(function (response) {
          console.log(response);
          angular.extend($scope.fbData, response);

        $scope.intervalFunc = $interval($scope.currentPosition, 3000);

        $scope.currentPosition();

        }, function (error) {
          console.log(error);
        });

        $scope.friends = [];
        $scope.friendsPicturePath = '';
        ngFB.api({path: '/me/friends'})
        .then(function (response) {
          // console.log('friends.....', response.data);
          for (var i = 0; i < response.data.length; i++) {
            
            var temp = response.data[i];
            var friendId = response.data[i].id;
            $scope.friendsPicturePath = '/' + friendId + '/picture';
            
            ngFB.api({path: $scope.friendsPicturePath, 
              params: {redirect: false, height:50, width: 50}
            })
            .then(function (response) {
              temp.picture = response.data.url;
              $scope.friends.push(temp);
              // console.log('after adding picture.....', $scope.friends)
            }, function (error){
              console.log(error)
            })

          }
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
          $location.path('/app/events');
        }, function (error) {
          console.log(error);
        });

        ngFB.api({
          path: '/me', 
          params: {}
        })
        .then(function (response) {
          console.log(response);
          angular.extend($scope.fbData, response);
          console.log("User ID: ", $scope.fbData.id);

          socket.emit('getEvents', $scope.fbData.id);

        }, function (error) {
          console.log(error);
        });

      } else {
          alert('Facebook login failed');
        }
    });
  };

  $scope.currentPosition = function () {
    navigator.geolocation.getCurrentPosition(function(pos) {
      var latitude = pos.coords.latitude;
      var longitude = pos.coords.longitude;

      var coords = {id: $scope.fbData.id, latitude: latitude, longitude: longitude};
      socket.emit('updateCoords', coords);
      
      }, function(error) {
        console.log('Unable to get location: ' + error.message);
    });
    socket.emit('getEvents', $scope.fbData.id);
  };

  $scope.eventHandler = function () {
    console.log('inside eventHandler...');
    if ( $scope.fbData.status === undefined ) {
      alert('you are not signed in!');
      $location.path('/app/home');
    } else {
      socket.emit('getEvents', $scope.fbData.id);
      console.log('emitting get events......');
      $location.path('/app/events');
    }
  };

  $scope.logout = function () {
    $interval.cancel($scope.intervalFunc);
    ngFB.logout()
    .then(function (response) {
      $scope.fbData = {};
      $location.path('/app/home');
    });
  };

  $scope.event = {};
  $scope.postEvent = function () {
    $scope.event.id = $scope.fbData.id;
    $scope.event.name = $scope.fbData.name;
    $scope.event.friends = $scope.invitedFriendList;
    // console.log($scope.event);
    socket.emit('formData', $scope.event);
    socket.emit('getEvents', $scope.fbData.id);
    $location.path('/app/events');
  };

  //TODO
  $scope.deleteEvent = function (event) {
    socket.emit('deleteEvent', event);
    socket.emit('getEvents', $scope.fbData.id);

  };
  
  $scope.invitedFriendList = [];
  $scope.invitedFriends = function (friend) {
    console.log('inside invitedFriends function....', friend);

    if ( $scope.invitedFriendList.indexOf(friend) === -1 ) {
      $scope.invitedFriendList.push(friend);
    } else {
      $scope.invitedFriendList.splice($scope.invitedFriendList.indexOf(friend), 1);
    }
    console.log('friend list.....', $scope.invitedFriendList);
  };
})

.controller('EventsCtrl', function ($scope, $location) {
  $scope.events = "";
  socket.on('retrieveEvent', function (events) {
    console.log('retrieve event through socket....', events);
    $scope.events = events;
  });
})

.controller('MapController', function ($scope, $ionicLoading, $compile, $cordovaGeolocation) {

  console.log('inside mapcontroller....');

  $scope.initialize = function (latitude, longitude) {
    console.log('in initialize function....', latitude, longitude);
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    console.log('initialize function...', myLatlng);
    
    var mapOptions = {
      center: myLatlng,
      zoom: 9,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"),
        mapOptions);


    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });

    $scope.map = map;
  };
  //google.maps.event.addDomListener(window, 'load', initialize);

  $scope.centerOnMe = function(event) {
    console.log("centerOnMe called.....")
    if(!$scope.map) {
      return;
    }
    $scope.loading = $ionicLoading.show({ showBackdrop: true });

    // navigator.geolocation.getCurrentPosition(function(pos) {
    //   var Latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    //   $scope.map.setCenter(Latlng);
    //   $scope.loading.hide();

    //   var marker = new google.maps.Marker({
    //     position: Latlng,
    //     map: $scope.map,
    //     icon: $scope.fbData.picture
    //   });

    // google.maps.event.addListener(marker, 'click', function() {
    //   infowindow.open(map,marker);
    // });

    // },
    // function(error) {
    //   alert('Unable to get location: ' + error.message);
    // });

  // var options = {timeout: 10000, enableHighAccuracy: true};
  // $cordovaGeolocation.getCurrentPosition(options)
  // .then( function(pos) {
    // success code

    // var Latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    var pictureUrl = '';
    if ( event.id === $scope.fbData.id ) {
      pictureUrl = $scope.fbData.picture;
    } else {
        for ( var j = 0; j < $scope.friends.length; j++ ) {
            if ( event.id === $scope.friends[j].id ) {
              pictureUrl = $scope.friends[j].picture;
            }
          }
      }
    var Latlng = new google.maps.LatLng(event.latitude, event.longitude);
      $scope.map.setCenter(Latlng);
      $scope.loading.hide();

      var marker = new google.maps.Marker({
        position: Latlng,
        map: $scope.map,
        icon: pictureUrl
      });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
  // }, function(error) {
  //   // error code
  //   alert('Unable to get location: ' + error.message);
  // });


  };


$scope.centerOnFriends = function(event) {
    console.log("centerOnFriends called.....")
    if(!$scope.map) {
      return;
    }
    $scope.loading = $ionicLoading.show({ showBackdrop: true });

    for ( var i = 0; i < event.friends.length; i++ ) { 
      var Latlng = new google.maps.LatLng(event.friends[i].latitude, event.friends[i].longitude);
        $scope.map.setCenter(Latlng);
        $scope.loading.hide();
        var pictureUrl = '';
        for ( var j = 0; j < $scope.friends.length; j++ ) {
          if ( event.friends[i].id === $scope.friends[j].id ) {
            pictureUrl = $scope.friends[j].picture;
          }
        }

        if ( event.friends[i].id === $scope.fbData.id ) {
            pictureUrl = $scope.fbData.picture;
          }

        var marker = new google.maps.Marker({
          position: Latlng,
          map: $scope.map,
          icon: pictureUrl
        });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
      });
    }
  };


  $scope.GetLocation = function (event) {
    console.log('in GetLocation function....');
    
    var geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ 'address': event.address }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        
        $scope.initialize(latitude, longitude);
        $scope.centerOnMe(event);
        $scope.centerOnFriends(event);

      } else {
          console.log("Request failed.");
        }
    });
  };
});
