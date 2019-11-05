"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

define([], function () {
  'use strict';
  /**
   * A controller which causes the enclosing Muuri Grid component to load grid item data from a remote datasource
   * 
   * @class muuridemo.components.gridUserData.controller
   */

  var GridUserDataController =
  /*#__PURE__*/
  function () {
    _createClass(GridUserDataController, null, [{
      key: "controllerName",
      get: function get() {
        return 'muuridemo.components.gridUserData.controller';
      }
    }, {
      key: "$inject",
      get: function get() {
        return ['itemLoadingService', 'muuridemo.services.smartLog'];
      }
      /**
       * Create a new Grid UserData Controller
       * @constructs GridUserDataController
       * @param {ItemLoadingService} itemLoadingService 
       * @param {muuridemo.services.SmartLog} log 
       */

    }]);

    function GridUserDataController(itemLoadingService, log) {
      _classCallCheck(this, GridUserDataController);

      this.itemLoadingService = itemLoadingService;
      this.log = log;
    }
    /**
     * On initialization of the controller, load dashboards, select the first one, and load its items
     */


    _createClass(GridUserDataController, [{
      key: "$onInit",
      value: function $onInit() {
        var _this = this;

        this.itemLoadingService.loadDashboards().then(function (dashboards) {
          _this.log.debug('Loaded dashboards:', dashboards);

          _this.itemLoadingService.loadLayout(dashboards[0], function (loadedItems) {
            _this.log.debug('Loaded items:', loadedItems);

            loadedItems.forEach(function (gridItem, idx) {
              _this.log.debug('Loaded item:', gridItem);

              if (gridItem.canDisplay) {
                var height = gridItem.views[0].height;
                var config = {
                  type: 'Text',
                  data: gridItem.tileInfo.demo.message
                };
                var width = 'S';
                var order = gridItem.tileInfo.order;
                var suspendLayout = idx === loadedItems.length - 1;

                _this.grid.addTile(height, width, config, order, suspendLayout);
              }
            });
          }, function () {
            _this.log.debug('Finished loading');
          });
        }, function (err) {
          _this.log.error('Dashboard load error!', err);
        });
      }
    }]);

    return GridUserDataController;
  }();

  return GridUserDataController;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL2NvbXBvbmVudHMvZ3JpZFVzZXJEYXRhL2dyaWRVc2VyRGF0YS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbImRlZmluZSIsIkdyaWRVc2VyRGF0YUNvbnRyb2xsZXIiLCJpdGVtTG9hZGluZ1NlcnZpY2UiLCJsb2ciLCJsb2FkRGFzaGJvYXJkcyIsInRoZW4iLCJkYXNoYm9hcmRzIiwiZGVidWciLCJsb2FkTGF5b3V0IiwibG9hZGVkSXRlbXMiLCJmb3JFYWNoIiwiZ3JpZEl0ZW0iLCJpZHgiLCJjYW5EaXNwbGF5IiwiaGVpZ2h0Iiwidmlld3MiLCJjb25maWciLCJ0eXBlIiwiZGF0YSIsInRpbGVJbmZvIiwiZGVtbyIsIm1lc3NhZ2UiLCJ3aWR0aCIsIm9yZGVyIiwic3VzcGVuZExheW91dCIsImxlbmd0aCIsImdyaWQiLCJhZGRUaWxlIiwiZXJyIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUFBLE1BQU0sQ0FBQyxFQUFELEVBQUssWUFBVTtBQUNqQjtBQUVBOzs7Ozs7QUFIaUIsTUFRWEMsc0JBUlc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDBCQVNlO0FBQ3hCLGVBQU8sOENBQVA7QUFDSDtBQVhZO0FBQUE7QUFBQSwwQkFZUTtBQUNqQixlQUFPLENBQUMsb0JBQUQsRUFBdUIsNkJBQXZCLENBQVA7QUFDSDtBQUVEOzs7Ozs7O0FBaEJhOztBQXNCYixvQ0FBWUMsa0JBQVosRUFBZ0NDLEdBQWhDLEVBQW9DO0FBQUE7O0FBQ2hDLFdBQUtELGtCQUFMLEdBQTBCQSxrQkFBMUI7QUFDQSxXQUFLQyxHQUFMLEdBQVdBLEdBQVg7QUFDSDtBQUVEOzs7OztBQTNCYTtBQUFBO0FBQUEsZ0NBOEJKO0FBQUE7O0FBQ0wsYUFBS0Qsa0JBQUwsQ0FBd0JFLGNBQXhCLEdBQXlDQyxJQUF6QyxDQUE4QyxVQUFBQyxVQUFVLEVBQUk7QUFDeEQsVUFBQSxLQUFJLENBQUNILEdBQUwsQ0FBU0ksS0FBVCxDQUFlLG9CQUFmLEVBQXFDRCxVQUFyQzs7QUFFQSxVQUFBLEtBQUksQ0FBQ0osa0JBQUwsQ0FBd0JNLFVBQXhCLENBQW1DRixVQUFVLENBQUMsQ0FBRCxDQUE3QyxFQUFrRCxVQUFDRyxXQUFELEVBQWlCO0FBQy9ELFlBQUEsS0FBSSxDQUFDTixHQUFMLENBQVNJLEtBQVQsQ0FBZSxlQUFmLEVBQWdDRSxXQUFoQzs7QUFFQUEsWUFBQUEsV0FBVyxDQUFDQyxPQUFaLENBQW9CLFVBQUNDLFFBQUQsRUFBV0MsR0FBWCxFQUFtQjtBQUNuQyxjQUFBLEtBQUksQ0FBQ1QsR0FBTCxDQUFTSSxLQUFULENBQWUsY0FBZixFQUErQkksUUFBL0I7O0FBRUEsa0JBQUlBLFFBQVEsQ0FBQ0UsVUFBYixFQUF5QjtBQUNyQixvQkFBTUMsTUFBTSxHQUFHSCxRQUFRLENBQUNJLEtBQVQsQ0FBZSxDQUFmLEVBQWtCRCxNQUFqQztBQUNBLG9CQUFNRSxNQUFNLEdBQUc7QUFDWEMsa0JBQUFBLElBQUksRUFBRSxNQURLO0FBRVhDLGtCQUFBQSxJQUFJLEVBQUVQLFFBQVEsQ0FBQ1EsUUFBVCxDQUFrQkMsSUFBbEIsQ0FBdUJDO0FBRmxCLGlCQUFmO0FBSUEsb0JBQU1DLEtBQUssR0FBRyxHQUFkO0FBQ0Esb0JBQU1DLEtBQUssR0FBR1osUUFBUSxDQUFDUSxRQUFULENBQWtCSSxLQUFoQztBQUNBLG9CQUFNQyxhQUFhLEdBQUdaLEdBQUcsS0FBS0gsV0FBVyxDQUFDZ0IsTUFBWixHQUFxQixDQUFuRDs7QUFFQSxnQkFBQSxLQUFJLENBQUNDLElBQUwsQ0FBVUMsT0FBVixDQUFrQmIsTUFBbEIsRUFBMEJRLEtBQTFCLEVBQWlDTixNQUFqQyxFQUF5Q08sS0FBekMsRUFBZ0RDLGFBQWhEO0FBQ0g7QUFDSixhQWZEO0FBZ0JILFdBbkJELEVBbUJHLFlBQU07QUFDTCxZQUFBLEtBQUksQ0FBQ3JCLEdBQUwsQ0FBU0ksS0FBVCxDQUFlLGtCQUFmO0FBQ0gsV0FyQkQ7QUFzQkgsU0F6QkQsRUF5QkcsVUFBQXFCLEdBQUcsRUFBSTtBQUNOLFVBQUEsS0FBSSxDQUFDekIsR0FBTCxDQUFTMEIsS0FBVCxDQUFlLHVCQUFmLEVBQXdDRCxHQUF4QztBQUNILFNBM0JEO0FBNEJIO0FBM0RZOztBQUFBO0FBQUE7O0FBOERqQixTQUFPM0Isc0JBQVA7QUFDSCxDQS9ESyxDQUFOIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKFtdLCBmdW5jdGlvbigpe1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBjb250cm9sbGVyIHdoaWNoIGNhdXNlcyB0aGUgZW5jbG9zaW5nIE11dXJpIEdyaWQgY29tcG9uZW50IHRvIGxvYWQgZ3JpZCBpdGVtIGRhdGEgZnJvbSBhIHJlbW90ZSBkYXRhc291cmNlXHJcbiAgICAgKiBcclxuICAgICAqIEBjbGFzcyBtdXVyaWRlbW8uY29tcG9uZW50cy5ncmlkVXNlckRhdGEuY29udHJvbGxlclxyXG4gICAgICovXHJcbiAgICBjbGFzcyBHcmlkVXNlckRhdGFDb250cm9sbGVyIHtcclxuICAgICAgICBzdGF0aWMgZ2V0IGNvbnRyb2xsZXJOYW1lKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ211dXJpZGVtby5jb21wb25lbnRzLmdyaWRVc2VyRGF0YS5jb250cm9sbGVyJztcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGljIGdldCAkaW5qZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gWydpdGVtTG9hZGluZ1NlcnZpY2UnLCAnbXV1cmlkZW1vLnNlcnZpY2VzLnNtYXJ0TG9nJ107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGUgYSBuZXcgR3JpZCBVc2VyRGF0YSBDb250cm9sbGVyXHJcbiAgICAgICAgICogQGNvbnN0cnVjdHMgR3JpZFVzZXJEYXRhQ29udHJvbGxlclxyXG4gICAgICAgICAqIEBwYXJhbSB7SXRlbUxvYWRpbmdTZXJ2aWNlfSBpdGVtTG9hZGluZ1NlcnZpY2UgXHJcbiAgICAgICAgICogQHBhcmFtIHttdXVyaWRlbW8uc2VydmljZXMuU21hcnRMb2d9IGxvZyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcihpdGVtTG9hZGluZ1NlcnZpY2UsIGxvZyl7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbUxvYWRpbmdTZXJ2aWNlID0gaXRlbUxvYWRpbmdTZXJ2aWNlO1xyXG4gICAgICAgICAgICB0aGlzLmxvZyA9IGxvZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9uIGluaXRpYWxpemF0aW9uIG9mIHRoZSBjb250cm9sbGVyLCBsb2FkIGRhc2hib2FyZHMsIHNlbGVjdCB0aGUgZmlyc3Qgb25lLCBhbmQgbG9hZCBpdHMgaXRlbXNcclxuICAgICAgICAgKi9cclxuICAgICAgICAkb25Jbml0KCl7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbUxvYWRpbmdTZXJ2aWNlLmxvYWREYXNoYm9hcmRzKCkudGhlbihkYXNoYm9hcmRzID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKCdMb2FkZWQgZGFzaGJvYXJkczonLCBkYXNoYm9hcmRzKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1Mb2FkaW5nU2VydmljZS5sb2FkTGF5b3V0KGRhc2hib2FyZHNbMF0sIChsb2FkZWRJdGVtcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKCdMb2FkZWQgaXRlbXM6JywgbG9hZGVkSXRlbXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsb2FkZWRJdGVtcy5mb3JFYWNoKChncmlkSXRlbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKCdMb2FkZWQgaXRlbTonLCBncmlkSXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEl0ZW0uY2FuRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gZ3JpZEl0ZW0udmlld3NbMF0uaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdUZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBncmlkSXRlbS50aWxlSW5mby5kZW1vLm1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3aWR0aCA9ICdTJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9yZGVyID0gZ3JpZEl0ZW0udGlsZUluZm8ub3JkZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdXNwZW5kTGF5b3V0ID0gaWR4ID09PSBsb2FkZWRJdGVtcy5sZW5ndGggLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZC5hZGRUaWxlKGhlaWdodCwgd2lkdGgsIGNvbmZpZywgb3JkZXIsIHN1c3BlbmRMYXlvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoJ0ZpbmlzaGVkIGxvYWRpbmcnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ0Rhc2hib2FyZCBsb2FkIGVycm9yIScsIGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gR3JpZFVzZXJEYXRhQ29udHJvbGxlcjtcclxufSk7Il19
