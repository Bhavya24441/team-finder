app.controller('RequestController', function ($scope, $http, ToastService, API_URL) {
  $scope.newRequest = { requiredSkills: [] };
  $scope.openRequests = [];
  $scope.myRequests = [];
  $scope.loading = true;
  $scope.saving = false;
  $scope.errorMessage = '';

  function loadRequests() {
    $scope.loading = true;
    return $http.get(API_URL + '/requests').then(function (response) {
      $scope.openRequests = response.data;
    }).catch(function (error) {
      $scope.errorMessage = error.data && error.data.message ? error.data.message : 'Could not load team requests.';
    }).finally(function () {
      $scope.loading = false;
    });
  }

  function loadMyRequests() {
    return $http.get(API_URL + '/requests/mine').then(function (response) {
      $scope.myRequests = response.data;
    }).catch(function (error) {
      $scope.errorMessage = error.data && error.data.message ? error.data.message : 'Could not load your applications.';
    });
  }

  $scope.refresh = function () {
    return Promise.all([loadRequests(), loadMyRequests()]);
  };
  $scope.refresh();

  $scope.postRequest = function () {
    if ($scope.saving || !$scope.newRequest.projectTitle) return;
    $scope.saving = true;
    $scope.errorMessage = '';
    $http.post(API_URL + '/requests', $scope.newRequest).then(function () {
      ToastService.show('Team request posted.');
      $scope.newRequest = { requiredSkills: [] };
      return $scope.refresh();
    }).catch(function (error) {
      $scope.errorMessage = error.data && error.data.message ? error.data.message : 'Could not post the request.';
    }).finally(function () {
      $scope.saving = false;
    });
  };

  $scope.apply = function (request) {
    if (request.applying) return;
    request.applying = true;
    $http.post(API_URL + '/requests/' + request._id + '/apply', {}).then(function (response) {
      ToastService.show(response.data.message || 'Application submitted.');
      request.hasApplied = true;
      return loadMyRequests();
    }).catch(function (error) {
      ToastService.show(error.data && error.data.message ? error.data.message : 'Could not apply to this request.', 'error');
    }).finally(function () {
      request.applying = false;
    });
  };

  $scope.respond = function (request, applicant, action) {
    applicant.responding = true;
    $http.put(API_URL + '/requests/' + request._id + '/respond', {
      applicantId: applicant.userId._id,
      action: action
    }).then(function (response) {
      ToastService.show(response.data.message);
      applicant.status = action === 'accept' ? 'accepted' : 'rejected';
      return $scope.refresh();
    }).catch(function (error) {
      ToastService.show(error.data && error.data.message ? error.data.message : 'Could not update this application.', 'error');
    }).finally(function () {
      applicant.responding = false;
    });
  };
});