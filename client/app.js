var app = angular.module('teamFinderApp', ['ngRoute']);

app.constant('API_URL', window.location.protocol + '//' + window.location.hostname + ':5000/api');

app.config(function ($routeProvider, $httpProvider, $locationProvider) {
  $locationProvider.hashPrefix('!');
  $httpProvider.defaults.withCredentials = true;

  function requireLogin(AuthService, $location, $q) {
    return AuthService.getCurrentUser().catch(function () {
      $location.path('/login');
      return $q.reject();
    });
  }
  requireLogin.$inject = ['AuthService', '$location', '$q'];

  $routeProvider
    .when('/login', { templateUrl: 'views/login.html', controller: 'AuthController' })
    .when('/signup', { templateUrl: 'views/signup.html', controller: 'AuthController' })
    .when('/profile', {
      templateUrl: 'views/profile.html',
      controller: 'ProfileController',
      resolve: { user: requireLogin }
    })
    .when('/search', {
      templateUrl: 'views/search.html',
      controller: 'SearchController',
      resolve: { user: requireLogin }
    })
    .when('/requests', {
      templateUrl: 'views/requests.html',
      controller: 'RequestController',
      resolve: { user: requireLogin }
    })
    .when('/trends', {
      templateUrl: 'views/trends.html',
      controller: 'TrendsController',
      resolve: { user: requireLogin }
    })
    .otherwise({ redirectTo: '/login' });
});

app.factory('ToastService', function ($rootScope, $timeout) {
  var timer;
  return {
    show: function (message, type) {
      $rootScope.toast = { message: message, type: type || 'success' };
      if (timer) $timeout.cancel(timer);
      timer = $timeout(function () { $rootScope.toast = { message: '', type: 'success' }; }, 3200);
    }
  };
});

app.factory('AuthService', function ($http, $q, API_URL) {
  var currentUser = null;
  var pendingRequest = null;
  return {
    getCurrentUser: function (refresh) {
      if (currentUser && !refresh) return $q.when(currentUser);
      if (pendingRequest && !refresh) return pendingRequest;
      pendingRequest = $http.get(API_URL + '/users/me').then(function (response) {
        currentUser = response.data;
        return currentUser;
      }).catch(function (error) {
        currentUser = null;
        return $q.reject(error);
      }).finally(function () {
        pendingRequest = null;
      });
      return pendingRequest;
    },
    setCurrentUser: function (user) {
      currentUser = user;
      return currentUser;
    },
    clear: function () {
      currentUser = null;
      pendingRequest = null;
    }
  };
});

app.controller('NavController', function ($scope, $rootScope, $location, $route, $http, AuthService, ToastService, API_URL) {
  $scope.currentUser = null;
  $scope.currentPath = $location.path();
  $scope.toast = $rootScope.toast || { message: '', type: 'success' };

  function refreshNavigation() {
    $scope.currentPath = $location.path();
    AuthService.getCurrentUser().then(function (user) {
      $scope.currentUser = user;
    }).catch(function () {
      $scope.currentUser = null;
    });
  }
  $scope.$on('$locationChangeSuccess', refreshNavigation);
  $scope.$on('$routeChangeSuccess', refreshNavigation);
  $scope.$watch(function () { return $rootScope.toast; }, function (value) {
    $scope.toast = value || { message: '', type: 'success' };
  });

  $scope.logout = function () {
    $http.post(API_URL + '/auth/logout', {}).then(function () {
      AuthService.clear();
      $scope.currentUser = null;
      ToastService.show('You are logged out.');
      $location.path('/login');
    }).catch(function () {
      ToastService.show('Could not log out. Please try again.', 'error');
    });
  };
});