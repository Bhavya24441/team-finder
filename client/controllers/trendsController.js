app.controller('TrendsController', function ($scope, $http, $timeout, API_URL) {
  $scope.skills = [];
  $scope.loading = true;
  $scope.errorMessage = '';

  $http.get(API_URL + '/stats/skill-demand').then(function (response) {
    $scope.skills = response.data;
    if ($scope.skills.length) {
      $timeout(function () { drawChart($scope.skills); }, 0);
    }
  }).catch(function (error) {
    $scope.errorMessage = error.data && error.data.message ? error.data.message : 'Could not load skill trends.';
  }).finally(function () {
    $scope.loading = false;
  });

  function drawChart(data) {
    var container = d3.select('#chart');
    container.selectAll('*').remove();
    if (!data.length) return;

    var width = 760;
    var rowHeight = 44;
    var height = data.length * rowHeight + 18;
    var labelWidth = 150;
    var rightSpace = 48;
    var barWidth = width - labelWidth - rightSpace;
    var maxCount = d3.max(data, function (item) { return item.count; }) || 1;
    var scale = d3.scaleLinear().domain([0, maxCount]).range([0, barWidth]);
    var svg = container.append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('role', 'img')
      .attr('aria-label', 'Most requested skills and their request counts');

    var rows = svg.selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', function (item, index) { return 'translate(0,' + (index * rowHeight + 8) + ')'; });

    rows.append('text')
      .attr('class', 'chart-label')
      .attr('x', labelWidth - 16)
      .attr('y', 20)
      .attr('text-anchor', 'end')
      .text(function (item) { return item.skill; });

    rows.append('rect')
      .attr('class', 'chart-bar')
      .attr('x', labelWidth)
      .attr('y', 4)
      .attr('width', function (item) { return scale(item.count); })
      .attr('height', 28)
      .attr('rx', 8);

    rows.append('text')
      .attr('class', 'chart-count')
      .attr('x', function (item) { return labelWidth + scale(item.count) + 10; })
      .attr('y', 21)
      .text(function (item) { return item.count; });
  }
});