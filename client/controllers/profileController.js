app.controller('ProfileController', function ($scope, $http, user, AuthService, ToastService, API_URL) {
  $scope.profile = angular.copy(user);
  $scope.busy = false;

  $scope.saveProfile = function () {
    if ($scope.busy) return;
    $scope.busy = true;
    $scope.errorMessage = '';
    $http.put(API_URL + '/users/me', {
      bio: $scope.profile.bio,
      skills: $scope.profile.skills,
      interests: $scope.profile.interests,
      availability: $scope.profile.availability
    }).then(function (response) {
      $scope.profile = response.data;
      AuthService.setCurrentUser(response.data);
      ToastService.show('Profile saved.');
    }).catch(function (error) {
      $scope.errorMessage = error.data && error.data.message ? error.data.message : 'Could not save your profile.';
    }).finally(function () {
      $scope.busy = false;
    });
  };
});