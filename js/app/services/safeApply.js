"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(['../constants', '../env'], function (constants, env) {
  'use strict';

  var inject = ['$rootScope', '$parse', '$log'];

  function safeApply(root, parse, $console) {
    return function (exp, scope) {
      if (!scope || !angular.isFunction(scope.$apply)) {
        if (env.LOG_LEVEL >= constants.LOG_LEVEL.WARN) {
          $console.warn('Provided scope value is not an angular rootscope.Scope object. Defaulting to $rootScope');
        }

        scope = root;
      }

      var phase = root.$$phase;

      if (phase === '$apply' || phase === '$digest') {
        // currently digesting - execute immediately
        if (angular.isFunction(exp)) {
          exp(scope);
        } else if (angular.isString(exp)) {
          parse(exp)(scope);
        } else {
          throw new Error('Cannot safely apply the specified expression, because it is an unsupported expression type: ' + _typeof(exp));
        }
      } else {
        // not currenly digesting - defer to scope.$apply
        scope.$apply(exp);
      }
    };
  }

  safeApply.$inject = inject;
  return angular.module('muuridemo.services.safeApply', []).factory('safeApply', safeApply);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL3NlcnZpY2VzL3NhZmVBcHBseS5qcyJdLCJuYW1lcyI6WyJkZWZpbmUiLCJjb25zdGFudHMiLCJlbnYiLCJpbmplY3QiLCJzYWZlQXBwbHkiLCJyb290IiwicGFyc2UiLCIkY29uc29sZSIsImV4cCIsInNjb3BlIiwiYW5ndWxhciIsImlzRnVuY3Rpb24iLCIkYXBwbHkiLCJMT0dfTEVWRUwiLCJXQVJOIiwid2FybiIsInBoYXNlIiwiJCRwaGFzZSIsImlzU3RyaW5nIiwiRXJyb3IiLCIkaW5qZWN0IiwibW9kdWxlIiwiZmFjdG9yeSJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBQSxNQUFNLENBQUMsQ0FBQyxjQUFELEVBQWlCLFFBQWpCLENBQUQsRUFBNkIsVUFBU0MsU0FBVCxFQUFvQkMsR0FBcEIsRUFBd0I7QUFDdkQ7O0FBRUEsTUFBSUMsTUFBTSxHQUFHLENBQUMsWUFBRCxFQUFlLFFBQWYsRUFBeUIsTUFBekIsQ0FBYjs7QUFDQSxXQUFTQyxTQUFULENBQW1CQyxJQUFuQixFQUF5QkMsS0FBekIsRUFBZ0NDLFFBQWhDLEVBQXlDO0FBRXJDLFdBQU8sVUFBU0MsR0FBVCxFQUFjQyxLQUFkLEVBQXFCO0FBQ3hCLFVBQUcsQ0FBQ0EsS0FBRCxJQUFVLENBQUNDLE9BQU8sQ0FBQ0MsVUFBUixDQUFtQkYsS0FBSyxDQUFDRyxNQUF6QixDQUFkLEVBQStDO0FBQzNDLFlBQUdWLEdBQUcsQ0FBQ1csU0FBSixJQUFpQlosU0FBUyxDQUFDWSxTQUFWLENBQW9CQyxJQUF4QyxFQUE2QztBQUN6Q1AsVUFBQUEsUUFBUSxDQUFDUSxJQUFULENBQWMseUZBQWQ7QUFDSDs7QUFDRE4sUUFBQUEsS0FBSyxHQUFHSixJQUFSO0FBQ0g7O0FBRUQsVUFBSVcsS0FBSyxHQUFHWCxJQUFJLENBQUNZLE9BQWpCOztBQUNBLFVBQUdELEtBQUssS0FBSyxRQUFWLElBQXNCQSxLQUFLLEtBQUssU0FBbkMsRUFBNkM7QUFDekM7QUFDQSxZQUFHTixPQUFPLENBQUNDLFVBQVIsQ0FBbUJILEdBQW5CLENBQUgsRUFBMkI7QUFDdkJBLFVBQUFBLEdBQUcsQ0FBQ0MsS0FBRCxDQUFIO0FBQ0gsU0FGRCxNQUVPLElBQUdDLE9BQU8sQ0FBQ1EsUUFBUixDQUFpQlYsR0FBakIsQ0FBSCxFQUF5QjtBQUM1QkYsVUFBQUEsS0FBSyxDQUFDRSxHQUFELENBQUwsQ0FBV0MsS0FBWDtBQUNILFNBRk0sTUFFQTtBQUNILGdCQUFNLElBQUlVLEtBQUosQ0FBVSx5R0FBd0dYLEdBQXhHLENBQVYsQ0FBTjtBQUNIO0FBQ0osT0FURCxNQVNPO0FBQ0g7QUFDQUMsUUFBQUEsS0FBSyxDQUFDRyxNQUFOLENBQWFKLEdBQWI7QUFDSDtBQUNKLEtBdEJEO0FBdUJIOztBQUVESixFQUFBQSxTQUFTLENBQUNnQixPQUFWLEdBQW9CakIsTUFBcEI7QUFFQSxTQUFPTyxPQUFPLENBQUNXLE1BQVIsQ0FBZSw4QkFBZixFQUErQyxFQUEvQyxFQUNGQyxPQURFLENBQ00sV0FETixFQUNtQmxCLFNBRG5CLENBQVA7QUFFSCxDQW5DSyxDQUFOIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKFsnLi4vY29uc3RhbnRzJywgJy4uL2VudiddLCBmdW5jdGlvbihjb25zdGFudHMsIGVudil7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIGluamVjdCA9IFsnJHJvb3RTY29wZScsICckcGFyc2UnLCAnJGxvZyddO1xyXG4gICAgZnVuY3Rpb24gc2FmZUFwcGx5KHJvb3QsIHBhcnNlLCAkY29uc29sZSl7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihleHAsIHNjb3BlKSB7XHJcbiAgICAgICAgICAgIGlmKCFzY29wZSB8fCAhYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLiRhcHBseSkpe1xyXG4gICAgICAgICAgICAgICAgaWYoZW52LkxPR19MRVZFTCA+PSBjb25zdGFudHMuTE9HX0xFVkVMLldBUk4pe1xyXG4gICAgICAgICAgICAgICAgICAgICRjb25zb2xlLndhcm4oJ1Byb3ZpZGVkIHNjb3BlIHZhbHVlIGlzIG5vdCBhbiBhbmd1bGFyIHJvb3RzY29wZS5TY29wZSBvYmplY3QuIERlZmF1bHRpbmcgdG8gJHJvb3RTY29wZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2NvcGUgPSByb290O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgcGhhc2UgPSByb290LiQkcGhhc2U7XHJcbiAgICAgICAgICAgIGlmKHBoYXNlID09PSAnJGFwcGx5JyB8fCBwaGFzZSA9PT0gJyRkaWdlc3QnKXtcclxuICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRseSBkaWdlc3RpbmcgLSBleGVjdXRlIGltbWVkaWF0ZWx5XHJcbiAgICAgICAgICAgICAgICBpZihhbmd1bGFyLmlzRnVuY3Rpb24oZXhwKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwKHNjb3BlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihhbmd1bGFyLmlzU3RyaW5nKGV4cCkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlKGV4cCkoc2NvcGUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzYWZlbHkgYXBwbHkgdGhlIHNwZWNpZmllZCBleHByZXNzaW9uLCBiZWNhdXNlIGl0IGlzIGFuIHVuc3VwcG9ydGVkIGV4cHJlc3Npb24gdHlwZTogJyArIHR5cGVvZiBleHApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbm90IGN1cnJlbmx5IGRpZ2VzdGluZyAtIGRlZmVyIHRvIHNjb3BlLiRhcHBseVxyXG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGV4cCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHNhZmVBcHBseS4kaW5qZWN0ID0gaW5qZWN0O1xyXG5cclxuICAgIHJldHVybiBhbmd1bGFyLm1vZHVsZSgnbXV1cmlkZW1vLnNlcnZpY2VzLnNhZmVBcHBseScsIFtdKVxyXG4gICAgICAgIC5mYWN0b3J5KCdzYWZlQXBwbHknLCBzYWZlQXBwbHkpO1xyXG59KTsiXX0=
