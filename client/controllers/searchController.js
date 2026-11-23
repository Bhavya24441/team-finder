app.controller('SearchController', function ($scope, $http, ToastService, API_URL) {
  $scope.skillsInput = '';
  $scope.results = [];
  $scope.myOpenRequests = [];
  $scope.searched = false;
  $scope.loading = false;
  $scope.myRequestsLoading = true;
  $scope.errorMessage = '';

  $http.get(API_URL + '/requests/mine').then(function (response) {
    $scope.myOpenRequests = response.data.filter(function (request) {
      return request.status === 'open';
    });
  }).catch(function () {
    $scope.myOpenRequests = [];
  }).finally(function () {
    $scope.myRequestsLoading = false;
  });

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

  $scope.toggleInviteOptions = function (student) {
    student.showInviteOptions = !student.showInviteOptions;
  };

  $scope.hasInvited = function (student, request) {
    return !!$scope.invitationStatus(student, request);
  };

  $scope.invitationStatus = function (student, request) {
    var invitation = (request.invitations || []).find(function (item) {
      var invitedUserId = item.userId && item.userId._id ? item.userId._id : item.userId;
      return invitedUserId === student._id;
    });
    return invitation ? invitation.status : null;
  };

  $scope.hasApplied = function (student, request) {
    return (request.applicants || []).some(function (application) {
      var applicantId = application.userId && application.userId._id ? application.userId._id : application.userId;
      return applicantId === student._id;
    });
  };

  $scope.inviteToRequest = function (student, request) {
    if (student.invitingToRequestId || $scope.hasInvited(student, request) || $scope.hasApplied(student, request)) return;
    student.invitingToRequestId = request._id;
    $http.post(API_URL + '/requests/' + request._id + '/invite', { userId: student._id })
      .then(function (response) {
        request.invitations = request.invitations || [];
        request.invitations.push({
          userId: { _id: student._id, name: student.name },
          status: 'pending',
          invitedAt: new Date()
        });
        ToastService.show(response.data.message || 'Team invitation sent.');
      }).catch(function (error) {
        ToastService.show(error.data && error.data.message ? error.data.message : 'Could not send this invitation.', 'error');
      }).finally(function () {
        student.invitingToRequestId = null;
      });
  };
});
