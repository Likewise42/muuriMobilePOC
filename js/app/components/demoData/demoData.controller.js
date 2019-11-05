"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

define([], function () {
  'use strict';

  var demoDataController =
  /*#__PURE__*/
  function () {
    _createClass(demoDataController, null, [{
      key: "controllerName",
      get: function get() {
        return 'muuridemo.components.demoData.controller';
      }
    }, {
      key: "$inject",
      get: function get() {
        return [];
      }
    }]);

    function demoDataController() {
      _classCallCheck(this, demoDataController);
    }

    _createClass(demoDataController, [{
      key: "$onInit",
      value: function $onInit() {
        this.grid.addTile('XL', 'M', {
          type: 'Text',
          data: 'tile1'
        });
        this.grid.addTile('XL', 'S', {
          type: 'Text',
          data: 'tile2'
        });
        this.grid.addTile('XL', 'S', {
          type: 'Text',
          data: 'tile3'
        });
        this.grid.addTile('XS', 'S', {
          type: 'Text',
          data: 'tile4'
        });
        this.grid.addTile('XS', 'S', {
          type: 'Text',
          data: 'tile5'
        });
        this.grid.addTile('XS', 'M', {
          type: 'Text',
          data: 'tile6'
        });
        this.grid.addTile('MD', 'M', {
          type: 'Text',
          data: 'tile7'
        });
        this.grid.addTile('XS', 'S', {
          type: 'Text',
          data: 'tile8'
        });
        this.grid.addTile('XS', 'S', {
          type: 'Text',
          data: 'tile9'
        });
        this.grid.addTile('SM', 'M', {
          type: 'Text',
          data: 'tile10'
        });
        this.grid.addTile('XL', 'S', {
          type: 'Text',
          data: 'tile11'
        });
        this.grid.addTile('MD', 'L', {
          type: 'Text',
          data: 'tile12'
        });
        this.grid.addTile('MD', 'M', {
          type: 'Text',
          data: 'tile13'
        });
        this.grid.addTile('MD', 'M', {
          type: 'Text',
          data: 'tile14'
        });
      }
    }]);

    return demoDataController;
  }();

  return demoDataController;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL2NvbXBvbmVudHMvZGVtb0RhdGEvZGVtb0RhdGEuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJkZWZpbmUiLCJkZW1vRGF0YUNvbnRyb2xsZXIiLCJncmlkIiwiYWRkVGlsZSIsInR5cGUiLCJkYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBQSxNQUFNLENBQUMsRUFBRCxFQUFLLFlBQVU7QUFDakI7O0FBRGlCLE1BR1hDLGtCQUhXO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwwQkFJZTtBQUN4QixlQUFPLDBDQUFQO0FBQ0g7QUFOWTtBQUFBO0FBQUEsMEJBT1E7QUFDakIsZUFBTyxFQUFQO0FBQ0g7QUFUWTs7QUFXYixrQ0FBYTtBQUFBO0FBQ1o7O0FBWlk7QUFBQTtBQUFBLGdDQWNKO0FBQ0wsYUFBS0MsSUFBTCxDQUFVQyxPQUFWLENBQWtCLElBQWxCLEVBQXdCLEdBQXhCLEVBQTZCO0FBQ3pCQyxVQUFBQSxJQUFJLEVBQUUsTUFEbUI7QUFFekJDLFVBQUFBLElBQUksRUFBRTtBQUZtQixTQUE3QjtBQUlBLGFBQUtILElBQUwsQ0FBVUMsT0FBVixDQUFrQixJQUFsQixFQUF3QixHQUF4QixFQUE2QjtBQUN6QkMsVUFBQUEsSUFBSSxFQUFFLE1BRG1CO0FBRXpCQyxVQUFBQSxJQUFJLEVBQUU7QUFGbUIsU0FBN0I7QUFLQSxhQUFLSCxJQUFMLENBQVVDLE9BQVYsQ0FBa0IsSUFBbEIsRUFBd0IsR0FBeEIsRUFBNkI7QUFDekJDLFVBQUFBLElBQUksRUFBRSxNQURtQjtBQUV6QkMsVUFBQUEsSUFBSSxFQUFFO0FBRm1CLFNBQTdCO0FBS0EsYUFBS0gsSUFBTCxDQUFVQyxPQUFWLENBQWtCLElBQWxCLEVBQXdCLEdBQXhCLEVBQTZCO0FBQ3pCQyxVQUFBQSxJQUFJLEVBQUUsTUFEbUI7QUFFekJDLFVBQUFBLElBQUksRUFBRTtBQUZtQixTQUE3QjtBQUlBLGFBQUtILElBQUwsQ0FBVUMsT0FBVixDQUFrQixJQUFsQixFQUF3QixHQUF4QixFQUE2QjtBQUN6QkMsVUFBQUEsSUFBSSxFQUFFLE1BRG1CO0FBRXpCQyxVQUFBQSxJQUFJLEVBQUU7QUFGbUIsU0FBN0I7QUFJQSxhQUFLSCxJQUFMLENBQVVDLE9BQVYsQ0FBa0IsSUFBbEIsRUFBd0IsR0FBeEIsRUFBNkI7QUFDekJDLFVBQUFBLElBQUksRUFBRSxNQURtQjtBQUV6QkMsVUFBQUEsSUFBSSxFQUFFO0FBRm1CLFNBQTdCO0FBSUEsYUFBS0gsSUFBTCxDQUFVQyxPQUFWLENBQWtCLElBQWxCLEVBQXdCLEdBQXhCLEVBQTZCO0FBQ3pCQyxVQUFBQSxJQUFJLEVBQUUsTUFEbUI7QUFFekJDLFVBQUFBLElBQUksRUFBRTtBQUZtQixTQUE3QjtBQUlBLGFBQUtILElBQUwsQ0FBVUMsT0FBVixDQUFrQixJQUFsQixFQUF3QixHQUF4QixFQUE2QjtBQUN6QkMsVUFBQUEsSUFBSSxFQUFFLE1BRG1CO0FBRXpCQyxVQUFBQSxJQUFJLEVBQUU7QUFGbUIsU0FBN0I7QUFJQSxhQUFLSCxJQUFMLENBQVVDLE9BQVYsQ0FBa0IsSUFBbEIsRUFBd0IsR0FBeEIsRUFBNkI7QUFDekJDLFVBQUFBLElBQUksRUFBRSxNQURtQjtBQUV6QkMsVUFBQUEsSUFBSSxFQUFFO0FBRm1CLFNBQTdCO0FBSUEsYUFBS0gsSUFBTCxDQUFVQyxPQUFWLENBQWtCLElBQWxCLEVBQXdCLEdBQXhCLEVBQTZCO0FBQ3pCQyxVQUFBQSxJQUFJLEVBQUUsTUFEbUI7QUFFekJDLFVBQUFBLElBQUksRUFBRTtBQUZtQixTQUE3QjtBQUlBLGFBQUtILElBQUwsQ0FBVUMsT0FBVixDQUFrQixJQUFsQixFQUF3QixHQUF4QixFQUE2QjtBQUN6QkMsVUFBQUEsSUFBSSxFQUFFLE1BRG1CO0FBRXpCQyxVQUFBQSxJQUFJLEVBQUU7QUFGbUIsU0FBN0I7QUFJQSxhQUFLSCxJQUFMLENBQVVDLE9BQVYsQ0FBa0IsSUFBbEIsRUFBd0IsR0FBeEIsRUFBNkI7QUFDekJDLFVBQUFBLElBQUksRUFBRSxNQURtQjtBQUV6QkMsVUFBQUEsSUFBSSxFQUFFO0FBRm1CLFNBQTdCO0FBSUEsYUFBS0gsSUFBTCxDQUFVQyxPQUFWLENBQWtCLElBQWxCLEVBQXdCLEdBQXhCLEVBQTZCO0FBQ3pCQyxVQUFBQSxJQUFJLEVBQUUsTUFEbUI7QUFFekJDLFVBQUFBLElBQUksRUFBRTtBQUZtQixTQUE3QjtBQUlBLGFBQUtILElBQUwsQ0FBVUMsT0FBVixDQUFrQixJQUFsQixFQUF3QixHQUF4QixFQUE2QjtBQUN6QkMsVUFBQUEsSUFBSSxFQUFFLE1BRG1CO0FBRXpCQyxVQUFBQSxJQUFJLEVBQUU7QUFGbUIsU0FBN0I7QUFLSDtBQTFFWTs7QUFBQTtBQUFBOztBQTZFakIsU0FBT0osa0JBQVA7QUFDSCxDQTlFSyxDQUFOIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKFtdLCBmdW5jdGlvbigpe1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNsYXNzIGRlbW9EYXRhQ29udHJvbGxlciB7XHJcbiAgICAgICAgc3RhdGljIGdldCBjb250cm9sbGVyTmFtZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdtdXVyaWRlbW8uY29tcG9uZW50cy5kZW1vRGF0YS5jb250cm9sbGVyJztcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGljIGdldCAkaW5qZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJG9uSW5pdCgpe1xyXG4gICAgICAgICAgICB0aGlzLmdyaWQuYWRkVGlsZSgnWEwnLCAnTScsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdUZXh0JyxcclxuICAgICAgICAgICAgICAgIGRhdGE6ICd0aWxlMSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKCdYTCcsICdTJywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogJ3RpbGUyJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKCdYTCcsICdTJywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogJ3RpbGUzJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKCdYUycsICdTJywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogJ3RpbGU0J1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5ncmlkLmFkZFRpbGUoJ1hTJywgJ1MnLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnVGV4dCcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiAndGlsZTUnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmdyaWQuYWRkVGlsZSgnWFMnLCAnTScsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdUZXh0JyxcclxuICAgICAgICAgICAgICAgIGRhdGE6ICd0aWxlNidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKCdNRCcsICdNJywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogJ3RpbGU3J1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5ncmlkLmFkZFRpbGUoJ1hTJywgJ1MnLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnVGV4dCcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiAndGlsZTgnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmdyaWQuYWRkVGlsZSgnWFMnLCAnUycsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdUZXh0JyxcclxuICAgICAgICAgICAgICAgIGRhdGE6ICd0aWxlOSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKCdTTScsICdNJywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogJ3RpbGUxMCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKCdYTCcsICdTJywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogJ3RpbGUxMSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKCdNRCcsICdMJywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogJ3RpbGUxMidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKCdNRCcsICdNJywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogJ3RpbGUxMydcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKCdNRCcsICdNJywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogJ3RpbGUxNCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVtb0RhdGFDb250cm9sbGVyO1xyXG59KTsiXX0=
