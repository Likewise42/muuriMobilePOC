"use strict";

define(['../env', '../constants'], function (env, constants) {
  var inject = ['$log'];
  var serviceName = 'muuridemo.services.smartLog';
  /**
   * A smart logging service, which only outputs messages if the the correct logging level is specified in the environment
   * @class muuridemo.services.SmartLog
   * @param {*} log The angular log service
   */

  function SmartLog(log) {
    /**
     * Log a fatal error
     * @method fatal
     * @memberof muuridemo.services.SmartLog
     * @param {...*} arg The arguments to log
     * @returns {void}
     */

    /**
     * Log an error
     * @method error
     * @memberof muuridemo.services.SmartLog
     * @param {...*} arg The arguments to log
     * @returns {void}
     */

    /**
     * Log a warning
     * @method warn
     * @memberof muuridemo.services.SmartLog
     * @param {...*} arg The arguments to log
     * @returns {void}
     */

    /**
     * Log an informational message
     * @method info
     * @memberof muuridemo.services.SmartLog
     * @param {...*} arg The arguments to log
     * @returns {void}
     */

    /**
     * Log a debug message
     * @method debug
     * @memberof muuridemo.services.SmartLog
     * @param {...*} arg The arguments to log
     * @returns {void}
     */
    if (env.LOG_LEVEL >= constants.LOG_LEVEL.FATAL) {
      this.fatal = function () {
        return log.error.apply(log, arguments);
      };
    } else {
      this.fatal = angular.noop;
    }

    if (env.LOG_LEVEL >= constants.LOG_LEVEL.ERROR) {
      this.error = function () {
        return log.error.apply(log, arguments);
      };
    } else {
      this.error = angular.noop;
    }

    if (env.LOG_LEVEL >= constants.LOG_LEVEL.WARN) {
      this.warn = function () {
        return log.warn.apply(log, arguments);
      };
    } else {
      this.warn = angular.noop;
    }

    if (env.LOG_LEVEL >= constants.LOG_LEVEL.INFO) {
      this.info = function () {
        return log.info.apply(log, arguments);
      };
    } else {
      this.info = angular.noop;
    }

    if (env.LOG_LEVEL >= constants.LOG_LEVEL.DEBUG) {
      this.debug = function () {
        for (var _len = arguments.length, arg = new Array(_len), _key = 0; _key < _len; _key++) {
          arg[_key] = arguments[_key];
        }

        return log.log.apply(log, ['[debug]'].concat(arg));
      };
    } else {
      this.debug = angular.noop;
    }
  }

  SmartLog.$inject = inject;
  SmartLog.serviceName = serviceName;
  return SmartLog;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL3NlcnZpY2VzL3NtYXJ0TG9nLmpzIl0sIm5hbWVzIjpbImRlZmluZSIsImVudiIsImNvbnN0YW50cyIsImluamVjdCIsInNlcnZpY2VOYW1lIiwiU21hcnRMb2ciLCJsb2ciLCJMT0dfTEVWRUwiLCJGQVRBTCIsImZhdGFsIiwiZXJyb3IiLCJhbmd1bGFyIiwibm9vcCIsIkVSUk9SIiwiV0FSTiIsIndhcm4iLCJJTkZPIiwiaW5mbyIsIkRFQlVHIiwiZGVidWciLCJhcmciLCIkaW5qZWN0Il0sIm1hcHBpbmdzIjoiOztBQUFBQSxNQUFNLENBQUMsQ0FBQyxRQUFELEVBQVcsY0FBWCxDQUFELEVBQTZCLFVBQVNDLEdBQVQsRUFBY0MsU0FBZCxFQUF5QjtBQUV4RCxNQUFNQyxNQUFNLEdBQUcsQ0FBQyxNQUFELENBQWY7QUFDQSxNQUFNQyxXQUFXLEdBQUcsNkJBQXBCO0FBRUE7Ozs7OztBQUtBLFdBQVNDLFFBQVQsQ0FBa0JDLEdBQWxCLEVBQXNCO0FBQ2xCOzs7Ozs7OztBQVFBOzs7Ozs7OztBQVFBOzs7Ozs7OztBQVFBOzs7Ozs7OztBQVFBOzs7Ozs7O0FBUUEsUUFBR0wsR0FBRyxDQUFDTSxTQUFKLElBQWlCTCxTQUFTLENBQUNLLFNBQVYsQ0FBb0JDLEtBQXhDLEVBQThDO0FBQzFDLFdBQUtDLEtBQUwsR0FBYTtBQUFBLGVBQVlILEdBQUcsQ0FBQ0ksS0FBSixPQUFBSixHQUFHLFlBQWY7QUFBQSxPQUFiO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsV0FBS0csS0FBTCxHQUFhRSxPQUFPLENBQUNDLElBQXJCO0FBQ0g7O0FBQ0QsUUFBR1gsR0FBRyxDQUFDTSxTQUFKLElBQWlCTCxTQUFTLENBQUNLLFNBQVYsQ0FBb0JNLEtBQXhDLEVBQThDO0FBQzFDLFdBQUtILEtBQUwsR0FBYTtBQUFBLGVBQVlKLEdBQUcsQ0FBQ0ksS0FBSixPQUFBSixHQUFHLFlBQWY7QUFBQSxPQUFiO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsV0FBS0ksS0FBTCxHQUFhQyxPQUFPLENBQUNDLElBQXJCO0FBQ0g7O0FBQ0QsUUFBR1gsR0FBRyxDQUFDTSxTQUFKLElBQWlCTCxTQUFTLENBQUNLLFNBQVYsQ0FBb0JPLElBQXhDLEVBQTZDO0FBQ3pDLFdBQUtDLElBQUwsR0FBWTtBQUFBLGVBQVlULEdBQUcsQ0FBQ1MsSUFBSixPQUFBVCxHQUFHLFlBQWY7QUFBQSxPQUFaO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsV0FBS1MsSUFBTCxHQUFZSixPQUFPLENBQUNDLElBQXBCO0FBQ0g7O0FBQ0QsUUFBR1gsR0FBRyxDQUFDTSxTQUFKLElBQWlCTCxTQUFTLENBQUNLLFNBQVYsQ0FBb0JTLElBQXhDLEVBQTZDO0FBQ3pDLFdBQUtDLElBQUwsR0FBWTtBQUFBLGVBQVlYLEdBQUcsQ0FBQ1csSUFBSixPQUFBWCxHQUFHLFlBQWY7QUFBQSxPQUFaO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsV0FBS1csSUFBTCxHQUFZTixPQUFPLENBQUNDLElBQXBCO0FBQ0g7O0FBQ0QsUUFBR1gsR0FBRyxDQUFDTSxTQUFKLElBQWlCTCxTQUFTLENBQUNLLFNBQVYsQ0FBb0JXLEtBQXhDLEVBQThDO0FBQzFDLFdBQUtDLEtBQUwsR0FBYTtBQUFBLDBDQUFJQyxHQUFKO0FBQUlBLFVBQUFBLEdBQUo7QUFBQTs7QUFBQSxlQUFZZCxHQUFHLENBQUNBLEdBQUosT0FBQUEsR0FBRyxHQUFLLFNBQUwsU0FBbUJjLEdBQW5CLEVBQWY7QUFBQSxPQUFiO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsV0FBS0QsS0FBTCxHQUFhUixPQUFPLENBQUNDLElBQXJCO0FBQ0g7QUFDSjs7QUFFRFAsRUFBQUEsUUFBUSxDQUFDZ0IsT0FBVCxHQUFtQmxCLE1BQW5CO0FBQ0FFLEVBQUFBLFFBQVEsQ0FBQ0QsV0FBVCxHQUF1QkEsV0FBdkI7QUFFQSxTQUFPQyxRQUFQO0FBQ0gsQ0FsRkssQ0FBTiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZShbJy4uL2VudicsICcuLi9jb25zdGFudHMnXSwgZnVuY3Rpb24oZW52LCBjb25zdGFudHMpIHtcclxuXHJcbiAgICBjb25zdCBpbmplY3QgPSBbJyRsb2cnXTtcclxuICAgIGNvbnN0IHNlcnZpY2VOYW1lID0gJ211dXJpZGVtby5zZXJ2aWNlcy5zbWFydExvZyc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHNtYXJ0IGxvZ2dpbmcgc2VydmljZSwgd2hpY2ggb25seSBvdXRwdXRzIG1lc3NhZ2VzIGlmIHRoZSB0aGUgY29ycmVjdCBsb2dnaW5nIGxldmVsIGlzIHNwZWNpZmllZCBpbiB0aGUgZW52aXJvbm1lbnRcclxuICAgICAqIEBjbGFzcyBtdXVyaWRlbW8uc2VydmljZXMuU21hcnRMb2dcclxuICAgICAqIEBwYXJhbSB7Kn0gbG9nIFRoZSBhbmd1bGFyIGxvZyBzZXJ2aWNlXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFNtYXJ0TG9nKGxvZyl7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTG9nIGEgZmF0YWwgZXJyb3JcclxuICAgICAgICAgKiBAbWV0aG9kIGZhdGFsXHJcbiAgICAgICAgICogQG1lbWJlcm9mIG11dXJpZGVtby5zZXJ2aWNlcy5TbWFydExvZ1xyXG4gICAgICAgICAqIEBwYXJhbSB7Li4uKn0gYXJnIFRoZSBhcmd1bWVudHMgdG8gbG9nXHJcbiAgICAgICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgICAgICovXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIExvZyBhbiBlcnJvclxyXG4gICAgICAgICAqIEBtZXRob2QgZXJyb3JcclxuICAgICAgICAgKiBAbWVtYmVyb2YgbXV1cmlkZW1vLnNlcnZpY2VzLlNtYXJ0TG9nXHJcbiAgICAgICAgICogQHBhcmFtIHsuLi4qfSBhcmcgVGhlIGFyZ3VtZW50cyB0byBsb2dcclxuICAgICAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTG9nIGEgd2FybmluZ1xyXG4gICAgICAgICAqIEBtZXRob2Qgd2FyblxyXG4gICAgICAgICAqIEBtZW1iZXJvZiBtdXVyaWRlbW8uc2VydmljZXMuU21hcnRMb2dcclxuICAgICAgICAgKiBAcGFyYW0gey4uLip9IGFyZyBUaGUgYXJndW1lbnRzIHRvIGxvZ1xyXG4gICAgICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICAgICAqL1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBMb2cgYW4gaW5mb3JtYXRpb25hbCBtZXNzYWdlXHJcbiAgICAgICAgICogQG1ldGhvZCBpbmZvXHJcbiAgICAgICAgICogQG1lbWJlcm9mIG11dXJpZGVtby5zZXJ2aWNlcy5TbWFydExvZ1xyXG4gICAgICAgICAqIEBwYXJhbSB7Li4uKn0gYXJnIFRoZSBhcmd1bWVudHMgdG8gbG9nXHJcbiAgICAgICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgICAgICovXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIExvZyBhIGRlYnVnIG1lc3NhZ2VcclxuICAgICAgICAgKiBAbWV0aG9kIGRlYnVnXHJcbiAgICAgICAgICogQG1lbWJlcm9mIG11dXJpZGVtby5zZXJ2aWNlcy5TbWFydExvZ1xyXG4gICAgICAgICAqIEBwYXJhbSB7Li4uKn0gYXJnIFRoZSBhcmd1bWVudHMgdG8gbG9nXHJcbiAgICAgICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoZW52LkxPR19MRVZFTCA+PSBjb25zdGFudHMuTE9HX0xFVkVMLkZBVEFMKXtcclxuICAgICAgICAgICAgdGhpcy5mYXRhbCA9ICguLi5hcmcpID0+IGxvZy5lcnJvciguLi5hcmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmF0YWwgPSBhbmd1bGFyLm5vb3A7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGVudi5MT0dfTEVWRUwgPj0gY29uc3RhbnRzLkxPR19MRVZFTC5FUlJPUil7XHJcbiAgICAgICAgICAgIHRoaXMuZXJyb3IgPSAoLi4uYXJnKSA9PiBsb2cuZXJyb3IoLi4uYXJnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVycm9yID0gYW5ndWxhci5ub29wO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlbnYuTE9HX0xFVkVMID49IGNvbnN0YW50cy5MT0dfTEVWRUwuV0FSTil7XHJcbiAgICAgICAgICAgIHRoaXMud2FybiA9ICguLi5hcmcpID0+IGxvZy53YXJuKC4uLmFyZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy53YXJuID0gYW5ndWxhci5ub29wO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlbnYuTE9HX0xFVkVMID49IGNvbnN0YW50cy5MT0dfTEVWRUwuSU5GTyl7XHJcbiAgICAgICAgICAgIHRoaXMuaW5mbyA9ICguLi5hcmcpID0+IGxvZy5pbmZvKC4uLmFyZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5pbmZvID0gYW5ndWxhci5ub29wO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlbnYuTE9HX0xFVkVMID49IGNvbnN0YW50cy5MT0dfTEVWRUwuREVCVUcpe1xyXG4gICAgICAgICAgICB0aGlzLmRlYnVnID0gKC4uLmFyZykgPT4gbG9nLmxvZygnW2RlYnVnXScsIC4uLmFyZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kZWJ1ZyA9IGFuZ3VsYXIubm9vcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgU21hcnRMb2cuJGluamVjdCA9IGluamVjdDtcclxuICAgIFNtYXJ0TG9nLnNlcnZpY2VOYW1lID0gc2VydmljZU5hbWU7XHJcblxyXG4gICAgcmV0dXJuIFNtYXJ0TG9nO1xyXG59KTsiXX0=
