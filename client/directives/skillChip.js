app.directive('skillChip', function () {
  return {
    restrict: 'E',
    scope: { items: '=' },
    template:
      '<div class="chip-editor">' +
        '<span class="chip" ng-repeat="item in items track by $index">' +
          '{{item}} <button type="button" class="chip-remove" aria-label="Remove {{item}}" ng-click="remove($index)">&times;</button>' +
        '</span>' +
        '<input type="text" ng-model="newItem" placeholder="Type a skill and press Enter" ng-keydown="add($event)" aria-label="Add a skill">' +
      '</div>',
    link: function (scope) {
      scope.items = scope.items || [];
      scope.add = function (event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        var value = (scope.newItem || '').trim().replace(/\s+/g, ' ');
        var exists = scope.items.some(function (item) { return item.toLowerCase() === value.toLowerCase(); });
        if (value && value.length <= 60 && !exists) scope.items.push(value);
        scope.newItem = '';
      };
      scope.remove = function (index) {
        scope.items.splice(index, 1);
      };
    }
  };
});