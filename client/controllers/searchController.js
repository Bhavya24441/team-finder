app.controller('SearchController', function ($scope, $http, API_URL) {
  $scope.skillsInput = '';
  $scope.results = [];
  $scope.searched = false;
  $scope.loading = false;
  $scope.errorMessage = '';

  $scope.doSearch = function () {
    if ($scope.loading) return;
    $scope.loading = true;
    $scope.errorMessage = '';
    $http.get(API_URL + '/users/search', { params: { skills: $scope.skillsInput } }).then(function (response) {
      $scope.results = response.data;
      $scope.searched = true;
    }).catch(function (error) {
      $scope.errorMessage = error.data && error.data.message ? error.data.message : 'Could not search right now. Please try again.';
    }).finally(function () {
      $scope.loading = false;
    });
  };
});