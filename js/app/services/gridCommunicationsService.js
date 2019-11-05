"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

define(['lib/rxjs', '../constants'], function (Rx, constants) {
  /**
   * Subract a subset from a superset, using selector to retrieve the values that will be
   * compared using strict equality.
   * @template T
   * @template U
   * @param {Function} selector
   * @param {T[]} superset
   * @param {U[]} subset
   * @returns {T[]} The subset items { item | item not in subset}
   */
  var subtractSet = function subtractSet(selector, superset, subset) {
    if (angular.isArray(superset)) {
      if (angular.isArray(subset) && subset.length) {
        var subValues = subset.map(selector);
        return superset.filter(function (superItem) {
          var superValue = selector(superItem);
          return !subValues.includes(superValue);
        });
      } else {
        return superset.concat([]);
      }
    } else {
      return [];
    }
  };
  /**
   * Listen for grid item source updates and set them into the sourceTiles pipeline
   * @param {GridCommunicationsService} comms 
   */


  function sourceTilesChanged(comms, log) {
    comms.pipelines.sourceTiles.subscribe(function (repo) {
      log.info('SourceTiles updated', repo);
    });
    comms.pipelines.global.pipe(Rx.operators.filter(function (evt) {
      return evt.eventName === constants.GRID_EVENTS.SOURCE_ITEMS_CHANGED;
    }), Rx.operators.tap(function (evt) {
      return log.info('Global: source tiles updated', evt);
    }), Rx.operators.scan(function (tileRepo, evt) {
      tileRepo[evt.gridName] = evt.eventData;
      return tileRepo;
    }, {})).subscribe(comms.pipelines.sourceTiles);
  }
  /**
   * 
   * @param {GridCommunicationsService} comms 
   */


  function displayedTilesChanged(comms, log) {
    comms.pipelines.displayedTiles.subscribe(function (repo) {
      log.info('DisplayedTiles updated', repo);
    });
    comms.pipelines.global.pipe(Rx.operators.map(function (evt) {
      var next = null;

      switch (evt.eventName) {
        case constants.GRID_EVENTS.DISPLAYED_ITEMS_ADDED:
          next = {
            operation: 'add',
            gridName: evt.gridName,
            tileId: evt.eventData.tileId
          };
          break;

        case constants.GRID_EVENTS.DISPLAYED_ITEMS_REMOVED:
          next = {
            operation: 'remove',
            gridName: evt.gridName,
            tileId: evt.eventData.tileId
          };
          break;
      }

      return next;
    }), Rx.operators.filter(function (evt) {
      return evt != null;
    }), Rx.operators.scan(function (result, _ref) {
      var operation = _ref.operation,
          gridName = _ref.gridName,
          tileId = _ref.tileId;

      if (!result[gridName]) {
        result[gridName] = [];
      }

      var gridItems = result[gridName];

      if (operation === 'add') {
        if (!gridItems.some(function (gi) {
          return gi.tileId === tileId;
        })) {
          gridItems.push({
            tileId: tileId
          });
        }
      } else if (operation === 'remove') {
        gridItems.filter(function (gi) {
          return gi.tileId !== tileId;
        });
      } else {
        log.error('Bad operation:', operation);
      }

      return result;
    }, {})).subscribe(comms.pipelines.displayedTiles);
  }
  /**
   * Watch the necessary pipelines to ensure that the available items pipeline stays current
   * @param {GridCommunicationsService} comms 
   */


  function generateAvailableItems(comms, log) {
    comms.pipelines.availableItems.subscribe(function (available) {
      log.info('Available items updated:', available);
    });
    Rx.combineLatest(comms.pipelines.sourceTiles, comms.pipelines.displayedTiles).pipe(Rx.operators.scan(function (prev, _ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
          source = _ref3[0],
          display = _ref3[1];

      if (!source) {
        source = prev;
      }

      if (!display) {
        display = {};
      }

      return Object.keys(source).concat(Object.keys(display)).reduce(function (result, gridName) {
        // If the merged result does not already have an entry for the current gridName...
        if (!result[gridName]) {
          result[gridName] = subtractSet(function (item) {
            return item.tileId;
          }, source[gridName], display[gridName]);
        }

        return result;
      }, {});
    }, {})).subscribe(comms.pipelines.availableItems);
  }

  var GridCommunicationsService =
  /*#__PURE__*/
  function () {
    _createClass(GridCommunicationsService, null, [{
      key: "serviceName",
      get: function get() {
        return 'muuridemo.services.gridCommunications';
      }
    }, {
      key: "$inject",
      get: function get() {
        return ['muuridemo.services.smartLog'];
      }
    }]);

    function GridCommunicationsService(log) {
      _classCallCheck(this, GridCommunicationsService);

      this.log = log;
      this.pipelines = {
        global: new Rx.Subject(),
        sourceTiles: new Rx.BehaviorSubject({}),
        displayedTiles: new Rx.BehaviorSubject({}),
        availableItems: new Rx.BehaviorSubject({})
      };
      this.pipelines.global.subscribe(function (evt) {
        log.debug('Global grid event', evt);
      });
      sourceTilesChanged(this, log);
      displayedTilesChanged(this, log);
      generateAvailableItems(this, log);
      this.announce('test', constants.GRID_EVENTS.SOURCE_ITEMS_CHANGED, [{
        tileId: 'boop'
      }]);
      this.announce('test', constants.GRID_EVENTS.DISPLAYED_ITEMS_ADDED, {
        tileId: 'boop'
      });
    }

    _createClass(GridCommunicationsService, [{
      key: "announce",
      value: function announce(gridName, eventName, eventData) {
        this.pipelines.global.next({
          gridName: gridName,
          eventName: eventName,
          eventData: eventData
        });
      }
    }]);

    return GridCommunicationsService;
  }();

  return GridCommunicationsService;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL3NlcnZpY2VzL2dyaWRDb21tdW5pY2F0aW9uc1NlcnZpY2UuanMiXSwibmFtZXMiOlsiZGVmaW5lIiwiUngiLCJjb25zdGFudHMiLCJzdWJ0cmFjdFNldCIsInNlbGVjdG9yIiwic3VwZXJzZXQiLCJzdWJzZXQiLCJhbmd1bGFyIiwiaXNBcnJheSIsImxlbmd0aCIsInN1YlZhbHVlcyIsIm1hcCIsImZpbHRlciIsInN1cGVySXRlbSIsInN1cGVyVmFsdWUiLCJpbmNsdWRlcyIsImNvbmNhdCIsInNvdXJjZVRpbGVzQ2hhbmdlZCIsImNvbW1zIiwibG9nIiwicGlwZWxpbmVzIiwic291cmNlVGlsZXMiLCJzdWJzY3JpYmUiLCJyZXBvIiwiaW5mbyIsImdsb2JhbCIsInBpcGUiLCJvcGVyYXRvcnMiLCJldnQiLCJldmVudE5hbWUiLCJHUklEX0VWRU5UUyIsIlNPVVJDRV9JVEVNU19DSEFOR0VEIiwidGFwIiwic2NhbiIsInRpbGVSZXBvIiwiZ3JpZE5hbWUiLCJldmVudERhdGEiLCJkaXNwbGF5ZWRUaWxlc0NoYW5nZWQiLCJkaXNwbGF5ZWRUaWxlcyIsIm5leHQiLCJESVNQTEFZRURfSVRFTVNfQURERUQiLCJvcGVyYXRpb24iLCJ0aWxlSWQiLCJESVNQTEFZRURfSVRFTVNfUkVNT1ZFRCIsInJlc3VsdCIsImdyaWRJdGVtcyIsInNvbWUiLCJnaSIsInB1c2giLCJlcnJvciIsImdlbmVyYXRlQXZhaWxhYmxlSXRlbXMiLCJhdmFpbGFibGVJdGVtcyIsImF2YWlsYWJsZSIsImNvbWJpbmVMYXRlc3QiLCJwcmV2Iiwic291cmNlIiwiZGlzcGxheSIsIk9iamVjdCIsImtleXMiLCJyZWR1Y2UiLCJpdGVtIiwiR3JpZENvbW11bmljYXRpb25zU2VydmljZSIsIlN1YmplY3QiLCJCZWhhdmlvclN1YmplY3QiLCJkZWJ1ZyIsImFubm91bmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLE1B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Y29uc3RhbnRzKXtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnJhY3QgYSBzdWJzZXQgZnJvbSBhIHN1cGVyc2V0LCB1c2luZyBzZWxlY3RvciB0byByZXRyaWV2ZSB0aGUgdmFsdWVzIHRoYXQgd2lsbCBiZVxyXG4gICAgICogY29tcGFyZWQgdXNpbmcgc3RyaWN0IGVxdWFsaXR5LlxyXG4gICAgICogQHRlbXBsYXRlIFRcclxuICAgICAqIEB0ZW1wbGF0ZSBVXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzZWxlY3RvclxyXG4gICAgICogQHBhcmFtIHtUW119IHN1cGVyc2V0XHJcbiAgICAgKiBAcGFyYW0ge1VbXX0gc3Vic2V0XHJcbiAgICAgKiBAcmV0dXJucyB7VFtdfSBUaGUgc3Vic2V0IGl0ZW1zIHsgaXRlbSB8IGl0ZW0gbm90IGluIHN1YnNldH1cclxuICAgICAqL1xyXG4gICAgY29uc3Qgc3VidHJhY3RTZXQgPSAoc2VsZWN0b3IsIHN1cGVyc2V0LCBzdWJzZXQpID0+IHtcclxuICAgICAgICBpZihhbmd1bGFyLmlzQXJyYXkoc3VwZXJzZXQpKXtcclxuICAgICAgICAgICAgaWYoYW5ndWxhci5pc0FycmF5KHN1YnNldCkgJiYgc3Vic2V0Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJWYWx1ZXMgPSBzdWJzZXQubWFwKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdXBlcnNldC5maWx0ZXIoc3VwZXJJdGVtID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdXBlclZhbHVlID0gc2VsZWN0b3Ioc3VwZXJJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXN1YlZhbHVlcy5pbmNsdWRlcyhzdXBlclZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1cGVyc2V0LmNvbmNhdChbXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBMaXN0ZW4gZm9yIGdyaWQgaXRlbSBzb3VyY2UgdXBkYXRlcyBhbmQgc2V0IHRoZW0gaW50byB0aGUgc291cmNlVGlsZXMgcGlwZWxpbmVcclxuICAgICAqIEBwYXJhbSB7R3JpZENvbW11bmljYXRpb25zU2VydmljZX0gY29tbXMgXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNvdXJjZVRpbGVzQ2hhbmdlZChjb21tcywgbG9nKSB7XHJcbiAgICAgICAgY29tbXMucGlwZWxpbmVzLnNvdXJjZVRpbGVzLnN1YnNjcmliZShyZXBvID0+IHtcclxuICAgICAgICAgICAgbG9nLmluZm8oJ1NvdXJjZVRpbGVzIHVwZGF0ZWQnLCByZXBvKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBjb21tcy5waXBlbGluZXMuZ2xvYmFsXHJcbiAgICAgICAgICAgIC5waXBlKFxyXG4gICAgICAgICAgICAgICAgUngub3BlcmF0b3JzLmZpbHRlcihldnQgPT4gZXZ0LmV2ZW50TmFtZSA9PT0gY29uc3RhbnRzLkdSSURfRVZFTlRTLlNPVVJDRV9JVEVNU19DSEFOR0VEKSxcclxuICAgICAgICAgICAgICAgIFJ4Lm9wZXJhdG9ycy50YXAoZXZ0ID0+IGxvZy5pbmZvKCdHbG9iYWw6IHNvdXJjZSB0aWxlcyB1cGRhdGVkJywgZXZ0KSksXHJcbiAgICAgICAgICAgICAgICBSeC5vcGVyYXRvcnMuc2NhbigodGlsZVJlcG8sIGV2dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbGVSZXBvW2V2dC5ncmlkTmFtZV0gPSBldnQuZXZlbnREYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aWxlUmVwbztcclxuICAgICAgICAgICAgICAgIH0sIHt9KVxyXG4gICAgICAgICAgICApLnN1YnNjcmliZShjb21tcy5waXBlbGluZXMuc291cmNlVGlsZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge0dyaWRDb21tdW5pY2F0aW9uc1NlcnZpY2V9IGNvbW1zIFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBkaXNwbGF5ZWRUaWxlc0NoYW5nZWQoY29tbXMsIGxvZykge1xyXG4gICAgICAgIGNvbW1zLnBpcGVsaW5lcy5kaXNwbGF5ZWRUaWxlcy5zdWJzY3JpYmUocmVwbyA9PiB7XHJcbiAgICAgICAgICAgIGxvZy5pbmZvKCdEaXNwbGF5ZWRUaWxlcyB1cGRhdGVkJywgcmVwbyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbW1zLnBpcGVsaW5lcy5nbG9iYWxcclxuICAgICAgICAgICAgLnBpcGUoXHJcbiAgICAgICAgICAgICAgICBSeC5vcGVyYXRvcnMubWFwKGV2dCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChldnQuZXZlbnROYW1lKXtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGNvbnN0YW50cy5HUklEX0VWRU5UUy5ESVNQTEFZRURfSVRFTVNfQURERUQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb246ICdhZGQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZE5hbWU6IGV2dC5ncmlkTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVJZDogZXZ0LmV2ZW50RGF0YS50aWxlSWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjb25zdGFudHMuR1JJRF9FVkVOVFMuRElTUExBWUVEX0lURU1TX1JFTU9WRUQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb246ICdyZW1vdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZE5hbWU6IGV2dC5ncmlkTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVJZDogZXZ0LmV2ZW50RGF0YS50aWxlSWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXh0O1xyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICBSeC5vcGVyYXRvcnMuZmlsdGVyKGV2dCA9PiBldnQhPW51bGwpLFxyXG4gICAgICAgICAgICAgICAgUngub3BlcmF0b3JzLnNjYW4oKHJlc3VsdCwge29wZXJhdGlvbiwgZ3JpZE5hbWUsIHRpbGVJZH0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZighcmVzdWx0W2dyaWROYW1lXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtncmlkTmFtZV0gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ3JpZEl0ZW1zID0gcmVzdWx0W2dyaWROYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICBpZihvcGVyYXRpb24gPT09ICdhZGQnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWdyaWRJdGVtcy5zb21lKGdpID0+IGdpLnRpbGVJZCA9PT0gdGlsZUlkKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkSXRlbXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlsZUlkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZihvcGVyYXRpb24gPT09ICdyZW1vdmUnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEl0ZW1zLmZpbHRlcihnaSA9PiBnaS50aWxlSWQgIT09IHRpbGVJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKCdCYWQgb3BlcmF0aW9uOicsIG9wZXJhdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgfSwge30pXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgLnN1YnNjcmliZShjb21tcy5waXBlbGluZXMuZGlzcGxheWVkVGlsZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2F0Y2ggdGhlIG5lY2Vzc2FyeSBwaXBlbGluZXMgdG8gZW5zdXJlIHRoYXQgdGhlIGF2YWlsYWJsZSBpdGVtcyBwaXBlbGluZSBzdGF5cyBjdXJyZW50XHJcbiAgICAgKiBAcGFyYW0ge0dyaWRDb21tdW5pY2F0aW9uc1NlcnZpY2V9IGNvbW1zIFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUF2YWlsYWJsZUl0ZW1zKGNvbW1zLCBsb2cpe1xyXG5cclxuICAgICAgICBjb21tcy5waXBlbGluZXMuYXZhaWxhYmxlSXRlbXMuc3Vic2NyaWJlKChhdmFpbGFibGUpID0+IHtcclxuICAgICAgICAgICAgbG9nLmluZm8oJ0F2YWlsYWJsZSBpdGVtcyB1cGRhdGVkOicsIGF2YWlsYWJsZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIFJ4LmNvbWJpbmVMYXRlc3QoXHJcbiAgICAgICAgICAgIGNvbW1zLnBpcGVsaW5lcy5zb3VyY2VUaWxlcyxcclxuICAgICAgICAgICAgY29tbXMucGlwZWxpbmVzLmRpc3BsYXllZFRpbGVzXHJcbiAgICAgICAgKS5waXBlKFJ4Lm9wZXJhdG9ycy5zY2FuKChwcmV2LCBbc291cmNlLCBkaXNwbGF5XSkgPT4ge1xyXG4gICAgICAgICAgICBpZighc291cmNlKXtcclxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IHByZXY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIWRpc3BsYXkpe1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheSA9IHt9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhzb3VyY2UpXHJcbiAgICAgICAgICAgICAgICAuY29uY2F0KE9iamVjdC5rZXlzKGRpc3BsYXkpKVxyXG4gICAgICAgICAgICAgICAgLnJlZHVjZSgocmVzdWx0LCBncmlkTmFtZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBtZXJnZWQgcmVzdWx0IGRvZXMgbm90IGFscmVhZHkgaGF2ZSBhbiBlbnRyeSBmb3IgdGhlIGN1cnJlbnQgZ3JpZE5hbWUuLi5cclxuICAgICAgICAgICAgICAgICAgICBpZighcmVzdWx0W2dyaWROYW1lXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtncmlkTmFtZV0gPSBzdWJ0cmFjdFNldCgoaXRlbSkgPT4gaXRlbS50aWxlSWQsIHNvdXJjZVtncmlkTmFtZV0sIGRpc3BsYXlbZ3JpZE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIH0sIHt9KTtcclxuICAgICAgICB9LCB7fSkpLnN1YnNjcmliZShjb21tcy5waXBlbGluZXMuYXZhaWxhYmxlSXRlbXMpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBHcmlkQ29tbXVuaWNhdGlvbnNTZXJ2aWNle1xyXG4gICAgICAgIHN0YXRpYyBnZXQgc2VydmljZU5hbWUoKXsgcmV0dXJuICdtdXVyaWRlbW8uc2VydmljZXMuZ3JpZENvbW11bmljYXRpb25zJzt9XHJcbiAgICAgICAgc3RhdGljIGdldCAkaW5qZWN0KCl7XHJcbiAgICAgICAgICAgIHJldHVybiBbJ211dXJpZGVtby5zZXJ2aWNlcy5zbWFydExvZyddO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IobG9nKXtcclxuICAgICAgICAgICAgdGhpcy5sb2cgPSBsb2c7XHJcbiAgICAgICAgICAgIHRoaXMucGlwZWxpbmVzID0ge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsOiBuZXcgUnguU3ViamVjdCgpLFxyXG4gICAgICAgICAgICAgICAgc291cmNlVGlsZXM6IG5ldyBSeC5CZWhhdmlvclN1YmplY3Qoe30pLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheWVkVGlsZXM6IG5ldyBSeC5CZWhhdmlvclN1YmplY3Qoe30pLFxyXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlSXRlbXM6IG5ldyBSeC5CZWhhdmlvclN1YmplY3Qoe30pXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBpcGVsaW5lcy5nbG9iYWwuc3Vic2NyaWJlKChldnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZygnR2xvYmFsIGdyaWQgZXZlbnQnLCBldnQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNvdXJjZVRpbGVzQ2hhbmdlZCh0aGlzLCBsb2cpO1xyXG4gICAgICAgICAgICBkaXNwbGF5ZWRUaWxlc0NoYW5nZWQodGhpcywgbG9nKTtcclxuICAgICAgICAgICAgZ2VuZXJhdGVBdmFpbGFibGVJdGVtcyh0aGlzLCBsb2cpO1xyXG4gICAgICAgICAgICB0aGlzLmFubm91bmNlKCd0ZXN0JywgY29uc3RhbnRzLkdSSURfRVZFTlRTLlNPVVJDRV9JVEVNU19DSEFOR0VELCBbIHtcclxuICAgICAgICAgICAgICAgIHRpbGVJZDogJ2Jvb3AnXHJcbiAgICAgICAgICAgIH1dKTtcclxuICAgICAgICAgICAgdGhpcy5hbm5vdW5jZSgndGVzdCcsIGNvbnN0YW50cy5HUklEX0VWRU5UUy5ESVNQTEFZRURfSVRFTVNfQURERUQsIHtcclxuICAgICAgICAgICAgICAgIHRpbGVJZDogJ2Jvb3AnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYW5ub3VuY2UoZ3JpZE5hbWUsIGV2ZW50TmFtZSwgZXZlbnREYXRhKXtcclxuICAgICAgICAgICAgdGhpcy5waXBlbGluZXMuZ2xvYmFsLm5leHQoe1xyXG4gICAgICAgICAgICAgICAgZ3JpZE5hbWUsXHJcbiAgICAgICAgICAgICAgICBldmVudE5hbWUsXHJcbiAgICAgICAgICAgICAgICBldmVudERhdGFcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gR3JpZENvbW11bmljYXRpb25zU2VydmljZTtcclxufSk7Il19
