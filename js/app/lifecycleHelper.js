"use strict";

define([], function () {
  /**
   * A filecycle helper to keep track of resources that must be cleaned up at some point in a component's lifecycle
   * @class muuridemo.LifecycleHelper
   */
  function LifecycleHelper() {
    var handlers = {};
    /**
     * Register a cleanup function for a specific item
     * @method register
     * @memberof muuridemo.LifecycleHelper
     * @param {string} itemId - the id of the item that needs to opt into lifecycle cleanup events
     * @param {function} cleanup - the cleanup function to run when this item is disposed
     */

    this.register = function (itemId, cleanup) {
      if (!angular.isString(itemId)) {
        throw new Error('Registered itemId must be a string');
      }

      if (!angular.isFunction(cleanup)) {
        throw new Error('registered cleanup function must be a function');
      }

      if (!handlers.hasOwnProperty(itemId)) {
        handlers[itemId] = [];
      }

      handlers[itemId].push(cleanup);
    };
    /**
     * Perform all registered cleanup actions for a given id
     * @method cleanup
     * @memberof muuridemo.LifecycleHelper
     * @param {string} itemId - the id of the item that needs to have its cleanup events run
     */


    this.cleanup = function (itemId) {
      if (!angular.isString(itemId)) {
        throw new Error('Specified itemId must be a string');
      }

      var cleaners = handlers[itemId] || [];
      var errors = [];
      cleaners.forEach(function (cleanup) {
        try {
          cleanup(itemId);
        } catch (err) {
          errors.push(err);
        }
      });
      return errors;
    };
  }

  return LifecycleHelper;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL2xpZmVjeWNsZUhlbHBlci5qcyJdLCJuYW1lcyI6WyJkZWZpbmUiLCJMaWZlY3ljbGVIZWxwZXIiLCJoYW5kbGVycyIsInJlZ2lzdGVyIiwiaXRlbUlkIiwiY2xlYW51cCIsImFuZ3VsYXIiLCJpc1N0cmluZyIsIkVycm9yIiwiaXNGdW5jdGlvbiIsImhhc093blByb3BlcnR5IiwicHVzaCIsImNsZWFuZXJzIiwiZXJyb3JzIiwiZm9yRWFjaCIsImVyciJdLCJtYXBwaW5ncyI6Ijs7QUFBQUEsTUFBTSxDQUFDLEVBQUQsRUFBSyxZQUFZO0FBRW5COzs7O0FBSUEsV0FBU0MsZUFBVCxHQUEyQjtBQUN2QixRQUFNQyxRQUFRLEdBQUcsRUFBakI7QUFFQTs7Ozs7Ozs7QUFPQSxTQUFLQyxRQUFMLEdBQWdCLFVBQUNDLE1BQUQsRUFBU0MsT0FBVCxFQUFxQjtBQUNqQyxVQUFJLENBQUNDLE9BQU8sQ0FBQ0MsUUFBUixDQUFpQkgsTUFBakIsQ0FBTCxFQUErQjtBQUMzQixjQUFNLElBQUlJLEtBQUosQ0FBVSxvQ0FBVixDQUFOO0FBQ0g7O0FBQ0QsVUFBSSxDQUFDRixPQUFPLENBQUNHLFVBQVIsQ0FBbUJKLE9BQW5CLENBQUwsRUFBa0M7QUFDOUIsY0FBTSxJQUFJRyxLQUFKLENBQVUsZ0RBQVYsQ0FBTjtBQUNIOztBQUNELFVBQUksQ0FBQ04sUUFBUSxDQUFDUSxjQUFULENBQXdCTixNQUF4QixDQUFMLEVBQXNDO0FBQ2xDRixRQUFBQSxRQUFRLENBQUNFLE1BQUQsQ0FBUixHQUFtQixFQUFuQjtBQUNIOztBQUNERixNQUFBQSxRQUFRLENBQUNFLE1BQUQsQ0FBUixDQUFpQk8sSUFBakIsQ0FBc0JOLE9BQXRCO0FBQ0gsS0FYRDtBQWFBOzs7Ozs7OztBQU1BLFNBQUtBLE9BQUwsR0FBZSxVQUFDRCxNQUFELEVBQVk7QUFDdkIsVUFBSSxDQUFDRSxPQUFPLENBQUNDLFFBQVIsQ0FBaUJILE1BQWpCLENBQUwsRUFBK0I7QUFDM0IsY0FBTSxJQUFJSSxLQUFKLENBQVUsbUNBQVYsQ0FBTjtBQUNIOztBQUNELFVBQU1JLFFBQVEsR0FBR1YsUUFBUSxDQUFDRSxNQUFELENBQVIsSUFBb0IsRUFBckM7QUFDQSxVQUFNUyxNQUFNLEdBQUcsRUFBZjtBQUNBRCxNQUFBQSxRQUFRLENBQUNFLE9BQVQsQ0FBaUIsVUFBQVQsT0FBTyxFQUFJO0FBQ3hCLFlBQUk7QUFDQUEsVUFBQUEsT0FBTyxDQUFDRCxNQUFELENBQVA7QUFDSCxTQUZELENBRUUsT0FBT1csR0FBUCxFQUFZO0FBQ1ZGLFVBQUFBLE1BQU0sQ0FBQ0YsSUFBUCxDQUFZSSxHQUFaO0FBQ0g7QUFDSixPQU5EO0FBT0EsYUFBT0YsTUFBUDtBQUNILEtBZEQ7QUFlSDs7QUFFRCxTQUFPWixlQUFQO0FBQ0gsQ0FyREssQ0FBTiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBmaWxlY3ljbGUgaGVscGVyIHRvIGtlZXAgdHJhY2sgb2YgcmVzb3VyY2VzIHRoYXQgbXVzdCBiZSBjbGVhbmVkIHVwIGF0IHNvbWUgcG9pbnQgaW4gYSBjb21wb25lbnQncyBsaWZlY3ljbGVcclxuICAgICAqIEBjbGFzcyBtdXVyaWRlbW8uTGlmZWN5Y2xlSGVscGVyXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIExpZmVjeWNsZUhlbHBlcigpIHtcclxuICAgICAgICBjb25zdCBoYW5kbGVycyA9IHt9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWdpc3RlciBhIGNsZWFudXAgZnVuY3Rpb24gZm9yIGEgc3BlY2lmaWMgaXRlbVxyXG4gICAgICAgICAqIEBtZXRob2QgcmVnaXN0ZXJcclxuICAgICAgICAgKiBAbWVtYmVyb2YgbXV1cmlkZW1vLkxpZmVjeWNsZUhlbHBlclxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpdGVtSWQgLSB0aGUgaWQgb2YgdGhlIGl0ZW0gdGhhdCBuZWVkcyB0byBvcHQgaW50byBsaWZlY3ljbGUgY2xlYW51cCBldmVudHNcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjbGVhbnVwIC0gdGhlIGNsZWFudXAgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhpcyBpdGVtIGlzIGRpc3Bvc2VkXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlciA9IChpdGVtSWQsIGNsZWFudXApID0+IHtcclxuICAgICAgICAgICAgaWYgKCFhbmd1bGFyLmlzU3RyaW5nKGl0ZW1JZCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVnaXN0ZXJlZCBpdGVtSWQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghYW5ndWxhci5pc0Z1bmN0aW9uKGNsZWFudXApKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlZ2lzdGVyZWQgY2xlYW51cCBmdW5jdGlvbiBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJzLmhhc093blByb3BlcnR5KGl0ZW1JZCkpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzW2l0ZW1JZF0gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyc1tpdGVtSWRdLnB1c2goY2xlYW51cCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUGVyZm9ybSBhbGwgcmVnaXN0ZXJlZCBjbGVhbnVwIGFjdGlvbnMgZm9yIGEgZ2l2ZW4gaWRcclxuICAgICAgICAgKiBAbWV0aG9kIGNsZWFudXBcclxuICAgICAgICAgKiBAbWVtYmVyb2YgbXV1cmlkZW1vLkxpZmVjeWNsZUhlbHBlclxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpdGVtSWQgLSB0aGUgaWQgb2YgdGhlIGl0ZW0gdGhhdCBuZWVkcyB0byBoYXZlIGl0cyBjbGVhbnVwIGV2ZW50cyBydW5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFudXAgPSAoaXRlbUlkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghYW5ndWxhci5pc1N0cmluZyhpdGVtSWQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NwZWNpZmllZCBpdGVtSWQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGNsZWFuZXJzID0gaGFuZGxlcnNbaXRlbUlkXSB8fCBbXTtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gW107XHJcbiAgICAgICAgICAgIGNsZWFuZXJzLmZvckVhY2goY2xlYW51cCA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFudXAoaXRlbUlkKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKGVycik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JzO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIExpZmVjeWNsZUhlbHBlcjtcclxufSk7Il19
