app.controller('AuthController', function ($scope, $http, $location, AuthService, ToastService, API_URL) {
  $scope.signupData = {};
  $scope.loginData = {};
  $scope.busy = false;
  $scope.errorMessage = '';

  $scope.signup = function () {
    if ($scope.busy || !$scope.signupData.name || !$scope.signupData.email || !$scope.signupData.password) return;
    $scope.busy = true;
    $scope.errorMessage = '';
    $http.post(API_URL + '/auth/signup', $scope.signupData).then(function () {
      ToastService.show('Account created. Please log in.');
      $location.path('/login');
    }).catch(function (error) {
      $scope.errorMessage = error.data && error.data.message ? error.data.message : 'Could not create the account. Please try again.';
    }).finally(function () {
      $scope.busy = false;
    });
  };

  $scope.login = function () {
    if ($scope.busy || !$scope.loginData.email || !$scope.loginData.password) return;
    $scope.busy = true;
    $scope.errorMessage = '';
    $http.post(API_URL + '/auth/login', $scope.loginData).then(function (response) {
      AuthService.clear();
      return AuthService.getCurrentUser(true).then(function (user) {
        AuthService.setCurrentUser(user);
        ToastService.show('Welcome back, ' + (response.data.name || user.name) + '.');
        $location.path('/profile');
      });
    }).catch(function (error) {
      $scope.errorMessage = error.data && error.data.message ? error.data.message : 'Could not log in. Check your details and try again.';
    }).finally(function () {
      $scope.busy = false;
    });
  };
});