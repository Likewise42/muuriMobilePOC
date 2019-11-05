"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @typedef LayoutItem An item in a saved dashboard layout
 * @property {string} tileId
 * @property {string} viewId
 * @property {string} height
 * @property {number} width
 * @property {number} order
 */

/**
 * @typedef DashboardLayout A saved dashboard layout
 * @property {string} layoutId - the unique id of this layout
 * @property {LayoutItem[]} items - the items in this layout
 */

/**
 * @typedef DashboardView defines a view that a dashboard item can use do identify its display needs
 * @property {boolean} [isDefault] - determine if this is the default view for this item
 * @property {string} viewId - an abitrary string uniquely identifying this view within the grid item's views
 * @property {string} height - a string indicating which grid item height this view uses
 * @property {number} width - a number indicating how many columns this view requires
 */

/**
 * @typedef ItemDefinition an item that can be displayed in a dashboard grid
 * @property {string} tileId - the unique id of the grid item
 * @property {string} [description] - the localization string describing this grid item
 * @property {DashboardView[]} views - the collection of views this grid item can use to display itself
 */
define(['lib/rxjs', 'require'], function (Rx, require) {
  'use strict';

  var urls = {
    layouts: require.toUrl('./demo-dashboard-layouts.json'),
    itemDefinitions: require.toUrl('./demo-dashboard-items.json')
  };

  var pvt = function pvt(symbol, destination, value) {
    Object.defineProperty(destination, symbol, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: value
    });
  };
  /**
   * An object describing a loaded grid item
   * @class muuridemo.services.LoadedGridItem
   */


  var LoadedGridItem =
  /**
   * Create a new LoadedGridItem
   * @constructs LoadedGridItem
   * @param {string} tileId The tile's unique id
   * @param {boolean} canDisplay If the grid item can be displayed
   * @param {DashboardView[]} views The views defined for this grid item
   * @param {*} tileInfo Information specific to the PoC for displaying tiles
   */
  function LoadedGridItem(tileId, canDisplay, views, tileInfo) {
    _classCallCheck(this, LoadedGridItem);

    this.tileId = tileId;
    this.canDisplay = canDisplay;
    this.views = views;
    this.tileInfo = tileInfo;
  };
  /**
   * A service for loading dashboards and grid items
   * @class muuridemo.services.ItemLoadingService
   */


  var ItemLoadingService =
  /*#__PURE__*/
  function () {
    _createClass(ItemLoadingService, null, [{
      key: "serviceName",
      get: function get() {
        return 'itemLoadingService';
      }
    }, {
      key: "$inject",
      get: function get() {
        return ['$q', '$http', 'safeApply', 'muuridemo.services.smartLog'];
      }
      /**
       * Create a new ItemLoadingService with the required Angular dependencies wired in
       * @constructs ItemLoadingService
       * @param {$q} q The Angular $q service
       * @param {$http} http The Angular $http service
       * @param {safeApply} safeApply The MuuriDemo safeApply function
       * @param {muuridemo.services.smartLog} log The MuuriDemo logger
       */

    }]);

    function ItemLoadingService(q, http, safeApply, log) {
      _classCallCheck(this, ItemLoadingService);

      pvt('q', this, q);
      pvt('http', this, http);
      pvt('safeApply', this, safeApply);
      pvt('log', this, log);
      this.partialLoad = true;
      this.staggeredLoad = true;
    }
    /**
     * Load the dashboards that this user has saved
     * @returns {Promise<Array>}
     */


    _createClass(ItemLoadingService, [{
      key: "loadDashboards",
      value: function loadDashboards() {
        return this.http.get(urls.layouts).then(function (response) {
          return response.data.layouts;
        });
      }
      /**
       * Switches on or off the 30% of tiles not loading interaction
       * @returns {boolean} the current status of partialLoad
       */

    }, {
      key: "togglePercentUnload",
      value: function togglePercentUnload() {
        this.partialLoad = !this.partialLoad;
        return this.partialLoad;
      }
      /**
       * Switches on or off having tiles load in staggered groups
       * @return {boolean} the current status of staggeredLoad
       */

    }, {
      key: "toggleStaggeredLoad",
      value: function toggleStaggeredLoad() {
        this.staggeredLoad = !this.staggeredLoad;
        return this.staggeredLoad;
      }
      /**
       * Load a dashboard layout
       * @param {DashboardLayout} dashboardLayout 
       * @param {Function} itemLoadedCallback 
       * @param {Function} loadFinishedCallback 
       * @returns {void}
       */

    }, {
      key: "loadLayout",
      value: function loadLayout(dashboardLayout, itemLoadedCallback, loadFinishedCallback) {
        var _this = this;

        var safeApply = this.safeApply;
        var inputPipe = new Rx.Subject();
        var loadingPipe = inputPipe.pipe(Rx.operators.buffer(Rx.interval(500)), Rx.operators.filter(function (x) {
          return x.length > 0;
        })); // instead of subscribing directly to the loadingPipe, we can add debounce or whatever via .pipe()

        var subscription = loadingPipe.subscribe({
          next: function next(loadedItem) {
            // console.log('Subscription:', loadedItem);
            safeApply(function () {
              itemLoadedCallback(loadedItem);
            });
          },
          complete: function complete() {
            subscription.unsubscribe();

            if (loadFinishedCallback && angular.isFunction(loadFinishedCallback)) {
              loadFinishedCallback();
            }
          },
          error: function error() {
            subscription.unsubscribe();
          }
        });
        this.http.get(urls.itemDefinitions).then(function (response) {
          return response.data.items;
        }).then(function (gridItemDefinitions) {
          var applicableTileIds = dashboardLayout.items.map(function (item) {
            return item.tileId;
          });
          var defs = gridItemDefinitions.reduce(function (map, definition) {
            if (applicableTileIds.includes(definition.tileId)) {
              map[definition.tileId] = definition;
            }

            return map;
          }, {}); //If partialLoad, randomly only load 70% of the tiles

          var displayedItems = _this.partialLoad ? dashboardLayout.items.filter(function () {
            return Math.random() < 0.7;
          }) : dashboardLayout.items;
          var timingGroups = {
            instant: [],
            fast: [],
            slow: []
          };
          var instantAmount = Math.round(displayedItems.length * 0.2);
          var slowAmount = Math.round(displayedItems.length * 0.3);

          var destructiveSample = function destructiveSample(src) {
            var idx = Math.floor(Math.random() * (src.length - 1));
            return src.splice(idx, 1)[0];
          };

          if (_this.staggeredLoad) {
            var _timingGroups$fast;

            while (timingGroups.instant.length < instantAmount) {
              timingGroups.instant.push(destructiveSample(displayedItems));
            }

            while (timingGroups.slow.length < slowAmount) {
              timingGroups.slow.push(destructiveSample(displayedItems));
            }

            (_timingGroups$fast = timingGroups.fast).push.apply(_timingGroups$fast, _toConsumableArray(displayedItems));
          } else {
            var _timingGroups$instant;

            (_timingGroups$instant = timingGroups.instant).push.apply(_timingGroups$instant, _toConsumableArray(displayedItems));
          }

          var itemLoaded = function itemLoaded(item) {
            _this.log.debug('Simulated load for item completed:', item); // get the definition for the grid item from the global registry


            var def = defs[item.tileId]; // create a copy of the loaded data so we can modify it without polluting

            var config = angular.copy(item);
            config.isPoC = true; // send the item into the loading pipeline

            inputPipe.next(new LoadedGridItem(item.tileId, true, def.views, config));
          };

          timingGroups.instant.forEach(itemLoaded);
          timingGroups.fast.forEach(function (item) {
            var delay = Math.floor(Math.random() * 1000) + 500;
            window.setTimeout(function () {
              itemLoaded(item);
            }, delay);
          });
          timingGroups.slow.forEach(function (item) {
            var delay = Math.floor(Math.random() * 1500) + 1500;
            window.setTimeout(function () {
              itemLoaded(item);
            }, delay);
          });
        });
      }
    }]);

    return ItemLoadingService;
  }();

  return ItemLoadingService;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL3NlcnZpY2VzL2l0ZW1Mb2FkaW5nU2VydmljZS5qcyJdLCJuYW1lcyI6WyJkZWZpbmUiLCJSeCIsInJlcXVpcmUiLCJ1cmxzIiwibGF5b3V0cyIsInRvVXJsIiwiaXRlbURlZmluaXRpb25zIiwicHZ0Iiwic3ltYm9sIiwiZGVzdGluYXRpb24iLCJ2YWx1ZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiTG9hZGVkR3JpZEl0ZW0iLCJ0aWxlSWQiLCJjYW5EaXNwbGF5Iiwidmlld3MiLCJ0aWxlSW5mbyIsIkl0ZW1Mb2FkaW5nU2VydmljZSIsInEiLCJodHRwIiwic2FmZUFwcGx5IiwibG9nIiwicGFydGlhbExvYWQiLCJzdGFnZ2VyZWRMb2FkIiwiZ2V0IiwidGhlbiIsInJlc3BvbnNlIiwiZGF0YSIsImRhc2hib2FyZExheW91dCIsIml0ZW1Mb2FkZWRDYWxsYmFjayIsImxvYWRGaW5pc2hlZENhbGxiYWNrIiwiaW5wdXRQaXBlIiwiU3ViamVjdCIsImxvYWRpbmdQaXBlIiwicGlwZSIsIm9wZXJhdG9ycyIsImJ1ZmZlciIsImludGVydmFsIiwiZmlsdGVyIiwieCIsImxlbmd0aCIsInN1YnNjcmlwdGlvbiIsInN1YnNjcmliZSIsIm5leHQiLCJsb2FkZWRJdGVtIiwiY29tcGxldGUiLCJ1bnN1YnNjcmliZSIsImFuZ3VsYXIiLCJpc0Z1bmN0aW9uIiwiZXJyb3IiLCJpdGVtcyIsImdyaWRJdGVtRGVmaW5pdGlvbnMiLCJhcHBsaWNhYmxlVGlsZUlkcyIsIm1hcCIsIml0ZW0iLCJkZWZzIiwicmVkdWNlIiwiZGVmaW5pdGlvbiIsImluY2x1ZGVzIiwiZGlzcGxheWVkSXRlbXMiLCJNYXRoIiwicmFuZG9tIiwidGltaW5nR3JvdXBzIiwiaW5zdGFudCIsImZhc3QiLCJzbG93IiwiaW5zdGFudEFtb3VudCIsInJvdW5kIiwic2xvd0Ftb3VudCIsImRlc3RydWN0aXZlU2FtcGxlIiwic3JjIiwiaWR4IiwiZmxvb3IiLCJzcGxpY2UiLCJwdXNoIiwiaXRlbUxvYWRlZCIsImRlYnVnIiwiZGVmIiwiY29uZmlnIiwiY29weSIsImlzUG9DIiwiZm9yRWFjaCIsImRlbGF5Iiwid2luZG93Iiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7Ozs7QUFTQTs7Ozs7O0FBTUE7Ozs7Ozs7O0FBUUE7Ozs7OztBQU9BQSxNQUFNLENBQUMsQ0FBQyxVQUFELEVBQWEsU0FBYixDQUFELEVBQ0YsVUFBVUMsRUFBVixFQUFjQyxPQUFkLEVBQXVCO0FBQ25COztBQUVBLE1BQU1DLElBQUksR0FBRztBQUNUQyxJQUFBQSxPQUFPLEVBQUVGLE9BQU8sQ0FBQ0csS0FBUixDQUFjLCtCQUFkLENBREE7QUFFVEMsSUFBQUEsZUFBZSxFQUFFSixPQUFPLENBQUNHLEtBQVIsQ0FBYyw2QkFBZDtBQUZSLEdBQWI7O0FBS0EsTUFBTUUsR0FBRyxHQUFHLFNBQU5BLEdBQU0sQ0FBQ0MsTUFBRCxFQUFTQyxXQUFULEVBQXNCQyxLQUF0QixFQUFnQztBQUN4Q0MsSUFBQUEsTUFBTSxDQUFDQyxjQUFQLENBQXNCSCxXQUF0QixFQUFtQ0QsTUFBbkMsRUFBMkM7QUFDdkNLLE1BQUFBLFlBQVksRUFBRSxLQUR5QjtBQUV2Q0MsTUFBQUEsVUFBVSxFQUFFLEtBRjJCO0FBR3ZDQyxNQUFBQSxRQUFRLEVBQUUsS0FINkI7QUFJdkNMLE1BQUFBLEtBQUssRUFBRUE7QUFKZ0MsS0FBM0M7QUFNSCxHQVBEO0FBU0E7Ozs7OztBQWpCbUIsTUFxQmJNLGNBckJhO0FBc0JmOzs7Ozs7OztBQVFBLDBCQUFZQyxNQUFaLEVBQW9CQyxVQUFwQixFQUFnQ0MsS0FBaEMsRUFBdUNDLFFBQXZDLEVBQWlEO0FBQUE7O0FBQzdDLFNBQUtILE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtDLFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0EsU0FBS0MsS0FBTCxH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LGFBQTFDLEVBQTRDNEIsS0FBNUM7QUFDSCxXQUhEO0FBSUgsU0FwRUw7QUFxRUg7QUFyTWM7O0FBQUE7QUFBQTs7QUF3TW5CLFNBQU9qRSxrQkFBUDtBQUNILENBMU1DLENBQU4iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQHR5cGVkZWYgTGF5b3V0SXRlbSBBbiBpdGVtIGluIGEgc2F2ZWQgZGFzaGJvYXJkIGxheW91dFxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdGlsZUlkXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2aWV3SWRcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IGhlaWdodFxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2lkdGhcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IG9yZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlZGVmIERhc2hib2FyZExheW91dCBBIHNhdmVkIGRhc2hib2FyZCBsYXlvdXRcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IGxheW91dElkIC0gdGhlIHVuaXF1ZSBpZCBvZiB0aGlzIGxheW91dFxyXG4gKiBAcHJvcGVydHkge0xheW91dEl0ZW1bXX0gaXRlbXMgLSB0aGUgaXRlbXMgaW4gdGhpcyBsYXlvdXRcclxuICovXHJcblxyXG4vKipcclxuICogQHR5cGVkZWYgRGFzaGJvYXJkVmlldyBkZWZpbmVzIGEgdmlldyB0aGF0IGEgZGFzaGJvYXJkIGl0ZW0gY2FuIHVzZSBkbyBpZGVudGlmeSBpdHMgZGlzcGxheSBuZWVkc1xyXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtpc0RlZmF1bHRdIC0gZGV0ZXJtaW5lIGlmIHRoaXMgaXMgdGhlIGRlZmF1bHQgdmlldyBmb3IgdGhpcyBpdGVtXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2aWV3SWQgLSBhbiBhYml0cmFyeSBzdHJpbmcgdW5pcXVlbHkgaWRlbnRpZnlpbmcgdGhpcyB2aWV3IHdpdGhpbiB0aGUgZ3JpZCBpdGVtJ3Mgdmlld3NcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IGhlaWdodCAtIGEgc3RyaW5nIGluZGljYXRpbmcgd2hpY2ggZ3JpZCBpdGVtIGhlaWdodCB0aGlzIHZpZXcgdXNlc1xyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2lkdGggLSBhIG51bWJlciBpbmRpY2F0aW5nIGhvdyBtYW55IGNvbHVtbnMgdGhpcyB2aWV3IHJlcXVpcmVzXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlZGVmIEl0ZW1EZWZpbml0aW9uIGFuIGl0ZW0gdGhhdCBjYW4gYmUgZGlzcGxheWVkIGluIGEgZGFzaGJvYXJkIGdyaWRcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHRpbGVJZCAtIHRoZSB1bmlxdWUgaWQgb2YgdGhlIGdyaWQgaXRlbVxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2Rlc2NyaXB0aW9uXSAtIHRoZSBsb2NhbGl6YXRpb24gc3RyaW5nIGRlc2NyaWJpbmcgdGhpcyBncmlkIGl0ZW1cclxuICogQHByb3BlcnR5IHtEYXNoYm9hcmRWaWV3W119IHZpZXdzIC0gdGhlIGNvbGxlY3Rpb24gb2Ygdmlld3MgdGhpcyBncmlkIGl0ZW0gY2FuIHVzZSB0byBkaXNwbGF5IGl0c2VsZlxyXG4gKi9cclxuXHJcbmRlZmluZShbJ2xpYi9yeGpzJywgJ3JlcXVpcmUnXSxcclxuICAgIGZ1bmN0aW9uIChSeCwgcmVxdWlyZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAgICAgY29uc3QgdXJscyA9IHtcclxuICAgICAgICAgICAgbGF5b3V0czogcmVxdWlyZS50b1VybCgnLi9kZW1vLWRhc2hib2FyZC1sYXlvdXRzLmpzb24nKSxcclxuICAgICAgICAgICAgaXRlbURlZmluaXRpb25zOiByZXF1aXJlLnRvVXJsKCcuL2RlbW8tZGFzaGJvYXJkLWl0ZW1zLmpzb24nKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IHB2dCA9IChzeW1ib2wsIGRlc3RpbmF0aW9uLCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdGluYXRpb24sIHN5bWJvbCwge1xyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFuIG9iamVjdCBkZXNjcmliaW5nIGEgbG9hZGVkIGdyaWQgaXRlbVxyXG4gICAgICAgICAqIEBjbGFzcyBtdXVyaWRlbW8uc2VydmljZXMuTG9hZGVkR3JpZEl0ZW1cclxuICAgICAgICAgKi9cclxuICAgICAgICBjbGFzcyBMb2FkZWRHcmlkSXRlbSB7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBDcmVhdGUgYSBuZXcgTG9hZGVkR3JpZEl0ZW1cclxuICAgICAgICAgICAgICogQGNvbnN0cnVjdHMgTG9hZGVkR3JpZEl0ZW1cclxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHRpbGVJZCBUaGUgdGlsZSdzIHVuaXF1ZSBpZFxyXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNhbkRpc3BsYXkgSWYgdGhlIGdyaWQgaXRlbSBjYW4gYmUgZGlzcGxheWVkXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSB7RGFzaGJvYXJkVmlld1tdfSB2aWV3cyBUaGUgdmlld3MgZGVmaW5lZCBmb3IgdGhpcyBncmlkIGl0ZW1cclxuICAgICAgICAgICAgICogQHBhcmFtIHsqfSB0aWxlSW5mbyBJbmZvcm1hdGlvbiBzcGVjaWZpYyB0byB0aGUgUG9DIGZvciBkaXNwbGF5aW5nIHRpbGVzXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcih0aWxlSWQsIGNhbkRpc3BsYXksIHZpZXdzLCB0aWxlSW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlSWQgPSB0aWxlSWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbkRpc3BsYXkgPSBjYW5EaXNwbGF5O1xyXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3cyA9IHZpZXdzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlSW5mbyA9IHRpbGVJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBIHNlcnZpY2UgZm9yIGxvYWRpbmcgZGFzaGJvYXJkcyBhbmQgZ3JpZCBpdGVtc1xyXG4gICAgICAgICAqIEBjbGFzcyBtdXVyaWRlbW8uc2VydmljZXMuSXRlbUxvYWRpbmdTZXJ2aWNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xhc3MgSXRlbUxvYWRpbmdTZXJ2aWNlIHtcclxuICAgICAgICAgICAgc3RhdGljIGdldCBzZXJ2aWNlTmFtZSgpIHsgcmV0dXJuICdpdGVtTG9hZGluZ1NlcnZpY2UnOyB9XHJcbiAgICAgICAgICAgIHN0YXRpYyBnZXQgJGluamVjdCgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbJyRxJywgJyRodHRwJywgJ3NhZmVBcHBseScsICdtdXVyaWRlbW8uc2VydmljZXMuc21hcnRMb2cnXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIENyZWF0ZSBhIG5ldyBJdGVtTG9hZGluZ1NlcnZpY2Ugd2l0aCB0aGUgcmVxdWlyZWQgQW5ndWxhciBkZXBlbmRlbmNpZXMgd2lyZWQgaW5cclxuICAgICAgICAgICAgICogQGNvbnN0cnVjdHMgSXRlbUxvYWRpbmdTZXJ2aWNlXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSB7JHF9IHEgVGhlIEFuZ3VsYXIgJHEgc2VydmljZVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0geyRodHRwfSBodHRwIFRoZSBBbmd1bGFyICRodHRwIHNlcnZpY2VcclxuICAgICAgICAgICAgICogQHBhcmFtIHtzYWZlQXBwbHl9IHNhZmVBcHBseSBUaGUgTXV1cmlEZW1vIHNhZmVBcHBseSBmdW5jdGlvblxyXG4gICAgICAgICAgICAgKiBAcGFyYW0ge211dXJpZGVtby5zZXJ2aWNlcy5zbWFydExvZ30gbG9nIFRoZSBNdXVyaURlbW8gbG9nZ2VyXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihxLCBodHRwLCBzYWZlQXBwbHksIGxvZykge1xyXG4gICAgICAgICAgICAgICAgcHZ0KCdxJywgdGhpcywgcSk7XHJcbiAgICAgICAgICAgICAgICBwdnQoJ2h0dHAnLCB0aGlzLCBodHRwKTtcclxuICAgICAgICAgICAgICAgIHB2dCgnc2FmZUFwcGx5JywgdGhpcywgc2FmZUFwcGx5KTtcclxuICAgICAgICAgICAgICAgIHB2dCgnbG9nJywgdGhpcywgbG9nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFydGlhbExvYWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFnZ2VyZWRMb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIExvYWQgdGhlIGRhc2hib2FyZHMgdGhhdCB0aGlzIHVzZXIgaGFzIHNhdmVkXHJcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxvYWREYXNoYm9hcmRzKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodXJscy5sYXlvdXRzKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmRhdGEubGF5b3V0cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBTd2l0Y2hlcyBvbiBvciBvZmYgdGhlIDMwJSBvZiB0aWxlcyBub3QgbG9hZGluZyBpbnRlcmFjdGlvblxyXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdGhlIGN1cnJlbnQgc3RhdHVzIG9mIHBhcnRpYWxMb2FkXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB0b2dnbGVQZXJjZW50VW5sb2FkKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWFsTG9hZCA9ICF0aGlzLnBhcnRpYWxMb2FkO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFydGlhbExvYWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBTd2l0Y2hlcyBvbiBvciBvZmYgaGF2aW5nIHRpbGVzIGxvYWQgaW4gc3RhZ2dlcmVkIGdyb3Vwc1xyXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0aGUgY3VycmVudCBzdGF0dXMgb2Ygc3RhZ2dlcmVkTG9hZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgdG9nZ2xlU3RhZ2dlcmVkTG9hZCgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhZ2dlcmVkTG9hZCA9ICF0aGlzLnN0YWdnZXJlZExvYWQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFnZ2VyZWRMb2FkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIExvYWQgYSBkYXNoYm9hcmQgbGF5b3V0XHJcbiAgICAgICAgICAgICAqIEBwYXJhbSB7RGFzaGJvYXJkTGF5b3V0fSBkYXNoYm9hcmRMYXlvdXQgXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZW1Mb2FkZWRDYWxsYmFjayBcclxuICAgICAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbG9hZEZpbmlzaGVkQ2FsbGJhY2sgXHJcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbG9hZExheW91dChkYXNoYm9hcmRMYXlvdXQsIGl0ZW1Mb2FkZWRDYWxsYmFjaywgbG9hZEZpbmlzaGVkQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhZmVBcHBseSA9IHRoaXMuc2FmZUFwcGx5O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRQaXBlID0gbmV3IFJ4LlN1YmplY3QoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRpbmdQaXBlID0gaW5wdXRQaXBlXHJcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ4Lm9wZXJhdG9ycy5idWZmZXIoUnguaW50ZXJ2YWwoNTAwKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJ4Lm9wZXJhdG9ycy5maWx0ZXIoeCA9PiB4Lmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIG9mIHN1YnNjcmliaW5nIGRpcmVjdGx5IHRvIHRoZSBsb2FkaW5nUGlwZSwgd2UgY2FuIGFkZCBkZWJvdW5jZSBvciB3aGF0ZXZlciB2aWEgLnBpcGUoKVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gbG9hZGluZ1BpcGUuc3Vic2NyaWJlKHtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0KGxvYWRlZEl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ1N1YnNjcmlwdGlvbjonLCBsb2FkZWRJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2FmZUFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1Mb2FkZWRDYWxsYmFjayhsb2FkZWRJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2FkRmluaXNoZWRDYWxsYmFjayAmJiBhbmd1bGFyLmlzRnVuY3Rpb24obG9hZEZpbmlzaGVkQ2FsbGJhY2spKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkRmluaXNoZWRDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5odHRwLmdldCh1cmxzLml0ZW1EZWZpbml0aW9ucylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5kYXRhLml0ZW1zKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGdyaWRJdGVtRGVmaW5pdGlvbnMgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhcHBsaWNhYmxlVGlsZUlkcyA9IGRhc2hib2FyZExheW91dC5pdGVtcy5tYXAoaXRlbSA9PiBpdGVtLnRpbGVJZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWZzID0gZ3JpZEl0ZW1EZWZpbml0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgobWFwLCBkZWZpbml0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcGxpY2FibGVUaWxlSWRzLmluY2x1ZGVzKGRlZmluaXRpb24udGlsZUlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBbZGVmaW5pdGlvbi50aWxlSWRdID0gZGVmaW5pdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHt9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSWYgcGFydGlhbExvYWQsIHJhbmRvbWx5IG9ubHkgbG9hZCA3MCUgb2YgdGhlIHRpbGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc3BsYXllZEl0ZW1zID0gdGhpcy5wYXJ0aWFsTG9hZCA/IGRhc2hib2FyZExheW91dC5pdGVtcy5maWx0ZXIoKCkgPT4gTWF0aC5yYW5kb20oKSA8IDAuNyk6IGRhc2hib2FyZExheW91dC5pdGVtcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWluZ0dyb3VwcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbnQ6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFzdDogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbG93OiBbXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdGFudEFtb3VudCA9IE1hdGgucm91bmQoZGlzcGxheWVkSXRlbXMubGVuZ3RoICogMC4yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2xvd0Ftb3VudCA9IE1hdGgucm91bmQoZGlzcGxheWVkSXRlbXMubGVuZ3RoICogMC4zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlc3RydWN0aXZlU2FtcGxlID0gKHNyYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHNyYy5sZW5ndGggLSAxKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3JjLnNwbGljZShpZHgsIDEpWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhZ2dlcmVkTG9hZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUodGltaW5nR3JvdXBzLmluc3RhbnQubGVuZ3RoIDwgaW5zdGFudEFtb3VudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltaW5nR3JvdXBzLmluc3RhbnQucHVzaChkZXN0cnVjdGl2ZVNhbXBsZShkaXNwbGF5ZWRJdGVtcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUodGltaW5nR3JvdXBzLnNsb3cubGVuZ3RoIDwgc2xvd0Ftb3VudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltaW5nR3JvdXBzLnNsb3cucHVzaChkZXN0cnVjdGl2ZVNhbXBsZShkaXNwbGF5ZWRJdGVtcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltaW5nR3JvdXBzLmZhc3QucHVzaCguLi5kaXNwbGF5ZWRJdGVtcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1pbmdHcm91cHMuaW5zdGFudC5wdXNoKC4uLmRpc3BsYXllZEl0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbUxvYWRlZCA9IChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnU2ltdWxhdGVkIGxvYWQgZm9yIGl0ZW0gY29tcGxldGVkOicsIGl0ZW0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgZGVmaW5pdGlvbiBmb3IgdGhlIGdyaWQgaXRlbSBmcm9tIHRoZSBnbG9iYWwgcmVnaXN0cnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlZiA9IGRlZnNbaXRlbS50aWxlSWRdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIGNvcHkgb2YgdGhlIGxvYWRlZCBkYXRhIHNvIHdlIGNhbiBtb2RpZnkgaXQgd2l0aG91dCBwb2xsdXRpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGFuZ3VsYXIuY29weShpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5pc1BvQyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgaXRlbSBpbnRvIHRoZSBsb2FkaW5nIHBpcGVsaW5lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dFBpcGUubmV4dChuZXcgTG9hZGVkR3JpZEl0ZW0oaXRlbS50aWxlSWQsIHRydWUsIGRlZi52aWV3cywgY29uZmlnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1pbmdHcm91cHMuaW5zdGFudC5mb3JFYWNoKGl0ZW1Mb2FkZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltaW5nR3JvdXBzLmZhc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMCkgKyA1MDA7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCk9PiB7aXRlbUxvYWRlZChpdGVtKTt9LCBkZWxheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltaW5nR3JvdXBzLnNsb3cuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTUwMCkgKyAxNTAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCk9PiB7aXRlbUxvYWRlZChpdGVtKTt9LCBkZWxheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gSXRlbUxvYWRpbmdTZXJ2aWNlO1xyXG4gICAgfSk7Il19
