"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

define([], function () {
  'use strict';

  var bulldozerDataController =
  /*#__PURE__*/
  function () {
    _createClass(bulldozerDataController, null, [{
      key: "controllerName",
      get: function get() {
        return 'muuridemo.components.bulldozerData.controller';
      }
    }, {
      key: "$inject",
      get: function get() {
        return [];
      }
    }]);

    function bulldozerDataController() {
      _classCallCheck(this, bulldozerDataController);
    }

    _createClass(bulldozerDataController, [{
      key: "tileCreation",
      value: function tileCreation(inputData) {
        this.grid.addTile('Small', 'Small', {
          type: 'Text',
          data: inputData
        });
      }
    }, {
      key: "$onInit",
      value: function $onInit() {
        this.tileCreation('tile1');
        this.tileCreation('tile2');
        this.tileCreation('tile3');
      }
    }]);

    return bulldozerDataController;
  }();

  return bulldozerDataController;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL2NvbXBvbmVudHMvYnVsbGRvemVyRGF0YS9idWxsZG96ZXJEYXRhLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiZGVmaW5lIiwiYnVsbGRvemVyRGF0YUNvbnRyb2xsZXIiLCJpbnB1dERhdGEiLCJncmlkIiwiYWRkVGlsZSIsInR5cGUiLCJkYXRhIiwidGlsZUNyZWF0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBQSxNQUFNLENBQUMsRUFBRCxFQUFLLFlBQVU7QUFDakI7O0FBRGlCLE1BR1hDLHVCQUhXO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwwQkFJZTtBQUN4QixlQUFPLCtDQUFQO0FBQ0g7QUFOWTtBQUFBO0FBQUEsMEJBT1E7QUFDakIsZUFBTyxFQUFQO0FBQ0g7QUFUWTs7QUFXYix1Q0FBYTtBQUFBO0FBQ1o7O0FBWlk7QUFBQTtBQUFBLG1DQWNBQyxTQWRBLEVBY1c7QUFDcEIsYUFBS0MsSUFBTCxDQUFVQyxPQUFWLENBQWtCLE9BQWxCLEVBQTJCLE9BQTNCLEVBQW9DO0FBQ2hDQyxVQUFBQSxJQUFJLEVBQUUsTUFEMEI7QUFFaENDLFVBQUFBLElBQUksRUFBRUo7QUFGMEIsU0FBcEM7QUFJSDtBQW5CWTtBQUFBO0FBQUEsZ0NBcUJIO0FBQ04sYUFBS0ssWUFBTCxDQUFrQixPQUFsQjtBQUNBLGFBQUtBLFlBQUwsQ0FBa0IsT0FBbEI7QUFDQSxhQUFLQSxZQUFMLENBQWtCLE9BQWxCO0FBQ0g7QUF6Qlk7O0FBQUE7QUFBQTs7QUE0QmpCLFNBQU9OLHVCQUFQO0FBQ0gsQ0E3QkssQ0FBTiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZShbXSwgZnVuY3Rpb24oKXtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjbGFzcyBidWxsZG96ZXJEYXRhQ29udHJvbGxlciB7XHJcbiAgICAgICAgc3RhdGljIGdldCBjb250cm9sbGVyTmFtZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdtdXVyaWRlbW8uY29tcG9uZW50cy5idWxsZG96ZXJEYXRhLmNvbnRyb2xsZXInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdGF0aWMgZ2V0ICRpbmplY3QoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aWxlQ3JlYXRpb24oaW5wdXREYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKCdTbWFsbCcsICdTbWFsbCcsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdUZXh0JyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGlucHV0RGF0YSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkb25Jbml0KCkge1xyXG4gICAgICAgICAgICB0aGlzLnRpbGVDcmVhdGlvbigndGlsZTEnKTtcclxuICAgICAgICAgICAgdGhpcy50aWxlQ3JlYXRpb24oJ3RpbGUyJyk7XHJcbiAgICAgICAgICAgIHRoaXMudGlsZUNyZWF0aW9uKCd0aWxlMycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYnVsbGRvemVyRGF0YUNvbnRyb2xsZXI7XHJcbn0pOyJdfQ==
