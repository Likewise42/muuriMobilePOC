"use strict";

define(['lib/rxjs'], function (Rx) {
  'use strict';

  var name = 'titleService';
  var inject = ['$document', 'muuridemo.services.smartLog'];

  function TitleService(documentCollection, log) {
    log.info('Title Service init', documentCollection);
    var document = documentCollection[0];
    var self = this;
    var titleSubject = new Rx.BehaviorSubject(document.title);

    self.get = function () {
      return document.title;
    };

    self.set = function (newTitle) {
      document.title = newTitle;
      titleSubject.next(newTitle);
    };

    self.subscribe = function (onNext) {
      var subscription = {};

      if (angular.isFunction(onNext)) {
        subscription.next = onNext;
      }

      return titleSubject.subscribe(subscription);
    };
  }

  TitleService.$inject = inject;
  TitleService.serviceName = name;
  return TitleService;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL3NlcnZpY2VzL3RpdGxlU2VydmljZS5qcyJdLCJuYW1lcyI6WyJkZWZpbmUiLCJSeCIsIm5hbWUiLCJpbmplY3QiLCJUaXRsZVNlcnZpY2UiLCJkb2N1bWVudENvbGxlY3Rpb24iLCJsb2ciLCJpbmZvIiwiZG9jdW1lbnQiLCJzZWxmIiwidGl0bGVTdWJqZWN0IiwiQmVoYXZpb3JTdWJqZWN0IiwidGl0bGUiLCJnZXQiLCJzZXQiLCJuZXdUaXRsZSIsIm5leHQiLCJzdWJzY3JpYmUiLCJvbk5leHQiLCJzdWJzY3JpcHRpb24iLCJhbmd1bGFyIiwiaXNGdW5jdGlvbiIsIiRpbmplY3QiLCJzZXJ2aWNlTmFtZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQUEsTUFBTSxDQUFDLENBQUMsVUFBRCxDQUFELEVBQWUsVUFBU0MsRUFBVCxFQUFZO0FBQzdCOztBQUVBLE1BQUlDLElBQUksR0FBRyxjQUFYO0FBQ0EsTUFBSUMsTUFBTSxHQUFHLENBQUMsV0FBRCxFQUFjLDZCQUFkLENBQWI7O0FBQ0EsV0FBU0MsWUFBVCxDQUFzQkMsa0JBQXRCLEVBQTBDQyxHQUExQyxFQUE4QztBQUMxQ0EsSUFBQUEsR0FBRyxDQUFDQyxJQUFKLENBQVMsb0JBQVQsRUFBK0JGLGtCQUEvQjtBQUVBLFFBQUlHLFFBQVEsR0FBR0gsa0JBQWtCLENBQUMsQ0FBRCxDQUFqQztBQUNBLFFBQUlJLElBQUksR0FBRyxJQUFYO0FBQ0EsUUFBSUMsWUFBWSxHQUFHLElBQUlULEVBQUUsQ0FBQ1UsZUFBUCxDQUF1QkgsUUFBUSxDQUFDSSxLQUFoQyxDQUFuQjs7QUFFQUgsSUFBQUEsSUFBSSxDQUFDSSxHQUFMLEdBQVcsWUFBVTtBQUNqQixhQUFPTCxRQUFRLENBQUNJLEtBQWhCO0FBQ0gsS0FGRDs7QUFHQUgsSUFBQUEsSUFBSSxDQUFDSyxHQUFMLEdBQVcsVUFBU0MsUUFBVCxFQUFrQjtBQUN6QlAsTUFBQUEsUUFBUSxDQUFDSSxLQUFULEdBQWlCRyxRQUFqQjtBQUNBTCxNQUFBQSxZQUFZLENBQUNNLElBQWIsQ0FBa0JELFFBQWxCO0FBQ0gsS0FIRDs7QUFJQU4sSUFBQUEsSUFBSSxDQUFDUSxTQUFMLEdBQWlCLFVBQVNDLE1BQVQsRUFBaUI7QUFDOUIsVUFBSUMsWUFBWSxHQUFHLEVBQW5COztBQUNBLFVBQUdDLE9BQU8sQ0FBQ0MsVUFBUixDQUFtQkgsTUFBbkIsQ0FBSCxFQUE4QjtBQUMxQkMsUUFBQUEsWUFBWSxDQUFDSCxJQUFiLEdBQW9CRSxNQUFwQjtBQUNIOztBQUNELGFBQU9SLFlBQVksQ0FBQ08sU0FBYixDQUF1QkUsWUFBdkIsQ0FBUDtBQUNILEtBTkQ7QUFPSDs7QUFFRGYsRUFBQUEsWUFBWSxDQUFDa0IsT0FBYixHQUF1Qm5CLE1BQXZCO0FBQ0FDLEVBQUFBLFlBQVksQ0FBQ21CLFdBQWIsR0FBMkJyQixJQUEzQjtBQUNBLFNBQU9FLFlBQVA7QUFDSCxDQS9CSyxDQUFOIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKFsnbGliL3J4anMnXSwgZnVuY3Rpb24oUngpe1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBuYW1lID0gJ3RpdGxlU2VydmljZSc7XHJcbiAgICB2YXIgaW5qZWN0ID0gWyckZG9jdW1lbnQnLCAnbXV1cmlkZW1vLnNlcnZpY2VzLnNtYXJ0TG9nJ107XHJcbiAgICBmdW5jdGlvbiBUaXRsZVNlcnZpY2UoZG9jdW1lbnRDb2xsZWN0aW9uLCBsb2cpe1xyXG4gICAgICAgIGxvZy5pbmZvKCdUaXRsZSBTZXJ2aWNlIGluaXQnLCBkb2N1bWVudENvbGxlY3Rpb24pO1xyXG5cclxuICAgICAgICB2YXIgZG9jdW1lbnQgPSBkb2N1bWVudENvbGxlY3Rpb25bMF07XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciB0aXRsZVN1YmplY3QgPSBuZXcgUnguQmVoYXZpb3JTdWJqZWN0KGRvY3VtZW50LnRpdGxlKTtcclxuXHJcbiAgICAgICAgc2VsZi5nZXQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQudGl0bGU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLnNldCA9IGZ1bmN0aW9uKG5ld1RpdGxlKXtcclxuICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBuZXdUaXRsZTtcclxuICAgICAgICAgICAgdGl0bGVTdWJqZWN0Lm5leHQobmV3VGl0bGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2VsZi5zdWJzY3JpYmUgPSBmdW5jdGlvbihvbk5leHQpIHtcclxuICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IHt9O1xyXG4gICAgICAgICAgICBpZihhbmd1bGFyLmlzRnVuY3Rpb24ob25OZXh0KSl7XHJcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24ubmV4dCA9IG9uTmV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGl0bGVTdWJqZWN0LnN1YnNjcmliZShzdWJzY3JpcHRpb24pO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgVGl0bGVTZXJ2aWNlLiRpbmplY3QgPSBpbmplY3Q7XHJcbiAgICBUaXRsZVNlcnZpY2Uuc2VydmljZU5hbWUgPSBuYW1lO1xyXG4gICAgcmV0dXJuIFRpdGxlU2VydmljZTtcclxufSk7Il19
