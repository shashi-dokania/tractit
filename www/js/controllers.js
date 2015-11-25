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
        
        console.log('Facebook login succeeded');
        $scope.closeLogin();
        
        ngFB.api({path: '/me'})
        .then(function (response) {
          console.log(response);
          angular.extend($scope.fbData, response);
          console.log("User ID: ", $scope.fbData.id);

          socket.emit('getEvents', $scope.fbData.id);

        }, function (error) {
          console.log(error);
        });

        $scope.friends = [];
        ngFB.api({path: '/me/friends'})
        .then(function (response) {
          console.log('friends.....', response.data);
          for (var i = 0; i < response.data.length; i++){
            $scope.friends.push(response.data[i]);
          }
          console.log('friends array.....', $scope.friends);
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
      } else {
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
      console.log('from events controller....', $scope.fbData.id);
      socket.emit('getEvents', $scope.fbData.id);
      console.log('emitting get events......');
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

  $scope.event = {};
  $scope.postEvent = function () {
    //console.log("FB ID:...", $scope.fbData.id);
    //console.log("FB Name:...", $scope.fbData.name);
    $scope.event.id = $scope.fbData.id;
    $scope.event.name = $scope.fbData.name;
    $scope.event.friends = $scope.invitedFriendList;
    console.log($scope.event);
    socket.emit('formData', $scope.event);
    socket.emit('getEvents', $scope.fbData.id);
  }
  
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

.controller('MapController', function($scope, $ionicLoading, $compile) {

  console.log('inside mapcontroller....');

  $scope.initialize = function() {
    console.log('lat', $scope.latitude)
    var myLatlng = new google.maps.LatLng($scope.latitude, $scope.longitude);
    console.log('initialize function...', myLatlng);
    
    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"),
        mapOptions);


    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Uluru (Ayers Rock)'
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });

    $scope.map = map;
  };
  //google.maps.event.addDomListener(window, 'load', initialize);
  $scope.latitude = '';
  $scope.longitude = '';

  $scope.GetLocation = function (address) {
    console.log('in GetLocation function....', address);
    
    var geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        console.log('set lat', $scope.latitude);

        var myLatlng = new google.maps.LatLng(latitude, longitude);
      
        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);


        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });

        $scope.map = map;
      } else {
          console.log("Request failed.");
        }
    });
  };

  
})

