"use strict";

define(['lib.lodash', '../../gridDom'], function (_, gridDom) {
  'use strict';
  /**
   * A labeled dimension value
   * @typedef {object} Dimension
   * @property {string} name The name of this enumerated dimension
   * @property {number} val The size of this enumerated dimension
   * 
   * A height and width pair of strings
   * @typedef {object} GridDimension
   * @property {string} height The enumerated height value of a grid item
   * @property {string} width The enumerated width value of a grid item
   *
   * Information about grid item heights
   * @typedef {object} HeightMetadata
   * @property {string[]} LABELS the labels for the grid item heights
   * @property {number[]} SIZES the pixel dimensions for the heights
   * @property {Dimension[]} PAIRS the height sizes keyed by their labels
   *
   * Information about grid item widths
   * @typedef {object} WidthMetadata
   * @property {string[]} LABELS the labels for the grid item width
   *
   * Information about grid item sizes
   * @typedef {object} GridSizeMetadata
   * @property {HeightMetadata} HEIGHTS information about the grid item heights
   * @property {WidthMetadata} WIDTHS information about grid item widths
   * 
   */

  /**
   * 
   * Format a height label as a CSS class
   * @param {string} height 
   */

  var formatHeight = function formatHeight(height) {
    return "h".concat(height);
  };

  var formatWidth = function formatWidth(width) {
    return "w".concat(width);
  };
  /**
   * @type {GridSizeMetadata}
   */


  var GRID_ITEM = {
    HEIGHTS: {
      LABELS: ['XS', 'SM', 'MD', 'LG', 'XL'],
      SIZES: [70, 145, 256, 322, 508],
      PAIRS: {},
      format: formatHeight
    },
    WIDTHS: {
      LABELS: ['S', 'M', 'L'],
      format: formatWidth
    }
  };
  GRID_ITEM.HEIGHTS.PAIRS = _.zipWith(GRID_ITEM.HEIGHTS.LABELS, GRID_ITEM.HEIGHTS.SIZES, function (name, val) {
    return {
      name: name,
      val: val
    };
  });
  /**
   * @constant {RegExp} ITEM_CLASS_SIZE_PATTERN The regex pattern used to test CSS class names for a known height/width
   */

  var ITEM_CLASS_SIZE_PATTERN = new RegExp("^(?:h(".concat(GRID_ITEM.HEIGHTS.LABELS.join('|'), "))|(?:w(").concat(GRID_ITEM.WIDTHS.LABELS.join('|'), "))$"));
  /**
   * Return a new grid dimension object with default values
   * @returns {GridDimension} a dimension object representing the 
   */

  var getDefaultDimension = function getDefaultDimension() {
    return {
      height: _.head(GRID_ITEM.HEIGHTS.LABELS),
      width: _.head(GRID_ITEM.WIDTHS.LABELS)
    };
  };
  /**
   * Get the tile dimensions of an element by inspecting its css classes
   * @param {HTMLElement} element 
   * @returns {GridDimension} the specified dimensions for the grid item
   */


  var getTileDimensions = function getTileDimensions(element) {
    return _(element.classList).map(function (cl) {
      return ITEM_CLASS_SIZE_PATTERN.exec(cl);
    }).filter().reduce(function (dim, match) {
      if (match[2]) {
        dim.width = match[2];
      } else if (match[1]) {
        dim.height = match[1];
      }

      return dim;
    }, getDefaultDimension());
  };
  /**
   * Select the next grid dimension height that should follow the current height
   * @param {GridDimension} dimension The current grid dimension
   * @returns {GridDimension} the next desired grid dimension
   */


  var selectNextHeight = function selectNextHeight(dimension) {
    var heightNames = GRID_ITEM.HEIGHTS.LABELS;

    var idx = _.indexOf(heightNames, dimension.height);

    console.log('> found index', idx, heightNames);
    var nextHeight = idx >= heightNames.length - 1 ? heightNames[0] : heightNames[idx + 1];
    console.log('> next height', nextHeight, heightNames[nextHeight]);
    return _.defaults({
      height: nextHeight
    }, dimension);
  };
  /**
   * Resize the tile to the next height in the cyle of heights
   * @param {HTMLElement} element The element that should be resized
   * @returns {void}
   */


  var incrementGridItemHeight = function incrementGridItemHeight(element) {
    var currSize = getTileDimensions(element);
    var nextSize = selectNextHeight(currSize);
    return gridDom.swapClasses(element, formatHeight(currSize.height), formatHeight(nextSize.height));
  };
  /**
   * 
   * @param {HTMLElement} elem The element that should be resized
   * @param {number} desiredHeight The desired pixel height of the element
   */


  var setBestHeight = function setBestHeight(elem, desiredHeight) {
    var foundHeight = _.find(GRID_ITEM.HEIGHTS.PAIRS, function (h) {
      return h.val >= desiredHeight;
    });

    var bestHeight = foundHeight ? foundHeight : _.last(GRID_ITEM.HEIGHTS.PAIRS);
    var current = getTileDimensions(elem);
    return gridDom.swapClasses(elem, formatHeight(current.height), formatHeight(bestHeight.name));
  };

  return {
    getTileDimensions: getTileDimensions,
    incrementGridItemHeight: incrementGridItemHeight,
    setBestHeight: setBestHeight
  };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL2NvbXBvbmVudHMvbXV1cmlHcmlkL2l0ZW1EaW1lbnNpb25zLmpzIl0sIm5hbWVzIjpbImRlZmluZSIsIl8iLCJncmlkRG9tIiwiZm9ybWF0SGVpZ2h0IiwiaGVpZ2h0IiwiZm9ybWF0V2lkdGgiLCJ3aWR0aCIsIkdSSURfSVRFTSIsIkhFSUdIVFMiLCJMQUJFTFMiLCJTSVpFUyIsIlBBSVJTIiwiZm9ybWF0IiwiV0lEVEhTIiwiemlwV2l0aCIsIm5hbWUiLCJ2YWwiLCJJVEVNX0NMQVNTX1NJWkVfUEFUVEVSTiIsIlJlZ0V4cCIsImpvaW4iLCJnZXREZWZhdWx0RGltZW5zaW9uIiwiaGVhZCIsImdldFRpbGVEaW1lbnNpb25zIiwiZWxlbWVudCIsImNsYXNzTGlzdCIsIm1hcCIsImNsIiwiZXhlYyIsImZpbHRlciIsInJlZHVjZSIsImRpbSIsIm1hdGNoIiwic2VsZWN0TmV4dEhlaWdodCIsImRpbWVuc2lvbiIsImhlaWdodE5hbWVzIiwiaWR4IiwiaW5kZXhPZiIsImNvbnNvbGUiLCJsb2ciLCJuZXh0SGVpZ2h0IiwibGVuZ3RoIiwiZGVmYXVsdHMiLCJpbmNyZW1lbnRHcmlkSXRlbUhlaWdodCIsImN1cnJTaXplIiwibmV4dFNpemUiLCJzd2FwQ2xhc3NlcyIsInNldEJlc3RIZWlnaHQiLCJlbGVtIiwiZGVzaXJlZEhlaWdodCIsImZvdW5kSGVpZ2h0IiwiZmluZCIsImgiLCJiZXN0SGVpZ2h0IiwibGFzdCIsImN1cnJlbnQiXSwibWFwcGluZ3MiOiI7O0FBQUFBLE1BQU0sQ0FBQyxDQUNILFlBREcsRUFFSCxlQUZHLENBQUQsRUFHSCxVQUNDQyxDQURELEVBRUNDLE9BRkQsRUFHRjtBQUNHO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QkE7Ozs7OztBQUtBLE1BQU1DLFlBQVksR0FBRyxTQUFmQSxZQUFlLENBQUNDLE1BQUQ7QUFBQSxzQkFBZ0JBLE1BQWhCO0FBQUEsR0FB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QUFJQSxDQUFDLENBQUNuQyxHQUFGLElBQVNnQyxhQUFiO0FBQUEsS0FBakMsQ0FBcEI7O0FBQ0EsUUFBTUksVUFBVSxHQUFHSCxXQUFXLEdBQUdBLFdBQUgsR0FBaUJoRCxDQUFDLENBQUNvRCxJQUFGLENBQU85QyxTQUFTLENBQUNDLE9BQVYsQ0FBa0JHLEtBQXpCLENBQS9DO0FBQ0EsUUFBTTJDLE9BQU8sR0FBR2hDLGlCQUFpQixDQUFDeUIsSUFBRCxDQUFqQztBQUNBLFdBQU83QyxPQUFPLENBQUMyQyxXQUFSLENBQW9CRSxJQUFwQixFQUEwQjVDLFlBQVksQ0FBQ21ELE9BQU8sQ0FBQ2xELE1BQVQsQ0FBdEMsRUFBd0RELFlBQVksQ0FBQ2lELFVBQVUsQ0FBQ3JDLElBQVosQ0FBcEUsQ0FBUDtBQUNILEdBTEQ7O0FBT0EsU0FBTztBQUNITyxJQUFBQSxpQkFBaUIsRUFBakJBLGlCQURHO0FBRUhvQixJQUFBQSx1QkFBdUIsRUFBdkJBLHVCQUZHO0FBR0hJLElBQUFBLGFBQWEsRUFBYkE7QUFIRyxHQUFQO0FBS0gsQ0E3SUssQ0FBTiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZShbXHJcbiAgICAnbGliLmxvZGFzaCcsXHJcbiAgICAnLi4vLi4vZ3JpZERvbSdcclxuXSwgZnVuY3Rpb24oXHJcbiAgICBfLFxyXG4gICAgZ3JpZERvbVxyXG4pe1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBsYWJlbGVkIGRpbWVuc2lvbiB2YWx1ZVxyXG4gICAgICogQHR5cGVkZWYge29iamVjdH0gRGltZW5zaW9uXHJcbiAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGlzIGVudW1lcmF0ZWQgZGltZW5zaW9uXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gdmFsIFRoZSBzaXplIG9mIHRoaXMgZW51bWVyYXRlZCBkaW1lbnNpb25cclxuICAgICAqIFxyXG4gICAgICogQSBoZWlnaHQgYW5kIHdpZHRoIHBhaXIgb2Ygc3RyaW5nc1xyXG4gICAgICogQHR5cGVkZWYge29iamVjdH0gR3JpZERpbWVuc2lvblxyXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IGhlaWdodCBUaGUgZW51bWVyYXRlZCBoZWlnaHQgdmFsdWUgb2YgYSBncmlkIGl0ZW1cclxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB3aWR0aCBUaGUgZW51bWVyYXRlZCB3aWR0aCB2YWx1ZSBvZiBhIGdyaWQgaXRlbVxyXG4gICAgICpcclxuICAgICAqIEluZm9ybWF0aW9uIGFib3V0IGdyaWQgaXRlbSBoZWlnaHRzXHJcbiAgICAgKiBAdHlwZWRlZiB7b2JqZWN0fSBIZWlnaHRNZXRhZGF0YVxyXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmdbXX0gTEFCRUxTIHRoZSBsYWJlbHMgZm9yIHRoZSBncmlkIGl0ZW0gaGVpZ2h0c1xyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJbXX0gU0laRVMgdGhlIHBpeGVsIGRpbWVuc2lvbnMgZm9yIHRoZSBoZWlnaHRzXHJcbiAgICAgKiBAcHJvcGVydHkge0RpbWVuc2lvbltdfSBQQUlSUyB0aGUgaGVpZ2h0IHNpemVzIGtleWVkIGJ5IHRoZWlyIGxhYmVsc1xyXG4gICAgICpcclxuICAgICAqIEluZm9ybWF0aW9uIGFib3V0IGdyaWQgaXRlbSB3aWR0aHNcclxuICAgICAqIEB0eXBlZGVmIHtvYmplY3R9IFdpZHRoTWV0YWRhdGFcclxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nW119IExBQkVMUyB0aGUgbGFiZWxzIGZvciB0aGUgZ3JpZCBpdGVtIHdpZHRoXHJcbiAgICAgKlxyXG4gICAgICogSW5mb3JtYXRpb24gYWJvdXQgZ3JpZCBpdGVtIHNpemVzXHJcbiAgICAgKiBAdHlwZWRlZiB7b2JqZWN0fSBHcmlkU2l6ZU1ldGFkYXRhXHJcbiAgICAgKiBAcHJvcGVydHkge0hlaWdodE1ldGFkYXRhfSBIRUlHSFRTIGluZm9ybWF0aW9uIGFib3V0IHRoZSBncmlkIGl0ZW0gaGVpZ2h0c1xyXG4gICAgICogQHByb3BlcnR5IHtXaWR0aE1ldGFkYXRhfSBXSURUSFMgaW5mb3JtYXRpb24gYWJvdXQgZ3JpZCBpdGVtIHdpZHRoc1xyXG4gICAgICogXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogRm9ybWF0IGEgaGVpZ2h0IGxhYmVsIGFzIGEgQ1NTIGNsYXNzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaGVpZ2h0IFxyXG4gICAgICovXHJcbiAgICBjb25zdCBmb3JtYXRIZWlnaHQgPSAoaGVpZ2h0KSA9PiBgaCR7aGVpZ2h0fWA7XHJcbiAgICBjb25zdCBmb3JtYXRXaWR0aCA9ICh3aWR0aCkgPT4gYHcke3dpZHRofWA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAdHlwZSB7R3JpZFNpemVNZXRhZGF0YX1cclxuICAgICAqL1xyXG4gICAgY29uc3QgR1JJRF9JVEVNID0ge1xyXG4gICAgICAgIEhFSUdIVFM6IHtcclxuICAgICAgICAgICAgTEFCRUxTOiBbJ1hTJywgJ1NNJywgJ01EJywgJ0xHJywgJ1hMJ10sXHJcbiAgICAgICAgICAgIFNJWkVTOiBbNzAsIDE0NSwgMjU2LCAzMjIsIDUwOF0sXHJcbiAgICAgICAgICAgIFBBSVJTOiB7fSxcclxuICAgICAgICAgICAgZm9ybWF0OiBmb3JtYXRIZWlnaHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIFdJRFRIUzoge1xyXG4gICAgICAgICAgICBMQUJFTFM6IFsnUycsICdNJywgJ0wnXSxcclxuICAgICAgICAgICAgZm9ybWF0OiBmb3JtYXRXaWR0aFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgR1JJRF9JVEVNLkhFSUdIVFMuUEFJUlMgPSBfLnppcFdpdGgoR1JJRF9JVEVNLkhFSUdIVFMuTEFCRUxTLCBHUklEX0lURU0uSEVJR0hUUy5TSVpFUywgKG5hbWUsIHZhbCkgPT4gKHtuYW1lLCB2YWx9KSk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBAY29uc3RhbnQge1JlZ0V4cH0gSVRFTV9DTEFTU19TSVpFX1BBVFRFUk4gVGhlIHJlZ2V4IHBhdHRlcm4gdXNlZCB0byB0ZXN0IENTUyBjbGFzcyBuYW1lcyBmb3IgYSBrbm93biBoZWlnaHQvd2lkdGhcclxuICAgICAqL1xyXG4gICAgY29uc3QgSVRFTV9DTEFTU19TSVpFX1BBVFRFUk4gPSBuZXcgUmVnRXhwKGBeKD86aCgke0dSSURfSVRFTS5IRUlHSFRTLkxBQkVMUy5qb2luKCd8Jyl9KSl8KD86dygke0dSSURfSVRFTS5XSURUSFMuTEFCRUxTLmpvaW4oJ3wnKX0pKSRgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIG5ldyBncmlkIGRpbWVuc2lvbiBvYmplY3Qgd2l0aCBkZWZhdWx0IHZhbHVlc1xyXG4gICAgICogQHJldHVybnMge0dyaWREaW1lbnNpb259IGEgZGltZW5zaW9uIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIFxyXG4gICAgICovXHJcbiAgICBjb25zdCBnZXREZWZhdWx0RGltZW5zaW9uID0gKCkgPT4gKHtcclxuICAgICAgICBoZWlnaHQ6IF8uaGVhZChHUklEX0lURU0uSEVJR0hUUy5MQUJFTFMpLFxyXG4gICAgICAgIHdpZHRoOiBfLmhlYWQoR1JJRF9JVEVNLldJRFRIUy5MQUJFTFMpXHJcbiAgICB9KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgdGlsZSBkaW1lbnNpb25zIG9mIGFuIGVsZW1lbnQgYnkgaW5zcGVjdGluZyBpdHMgY3NzIGNsYXNzZXNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgXHJcbiAgICAgKiBAcmV0dXJucyB7R3JpZERpbWVuc2lvbn0gdGhlIHNwZWNpZmllZCBkaW1lbnNpb25zIGZvciB0aGUgZ3JpZCBpdGVtXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGdldFRpbGVEaW1lbnNpb25zID0gKGVsZW1lbnQpID0+IHtcclxuICAgICAgICByZXR1cm4gXyhlbGVtZW50LmNsYXNzTGlzdClcclxuICAgICAgICAgICAgLm1hcChjbCA9PiBJVEVNX0NMQVNTX1NJWkVfUEFUVEVSTi5leGVjKGNsKSlcclxuICAgICAgICAgICAgLmZpbHRlcigpXHJcbiAgICAgICAgICAgIC5yZWR1Y2UoKGRpbSwgbWF0Y2gpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKG1hdGNoWzJdKXtcclxuICAgICAgICAgICAgICAgICAgICBkaW0ud2lkdGggPSBtYXRjaFsyXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihtYXRjaFsxXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZGltLmhlaWdodCA9IG1hdGNoWzFdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpbTtcclxuICAgICAgICAgICAgfSwgZ2V0RGVmYXVsdERpbWVuc2lvbigpKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZWxlY3QgdGhlIG5leHQgZ3JpZCBkaW1lbnNpb24gaGVpZ2h0IHRoYXQgc2hvdWxkIGZvbGxvdyB0aGUgY3VycmVudCBoZWlnaHRcclxuICAgICAqIEBwYXJhbSB7R3JpZERpbWVuc2lvbn0gZGltZW5zaW9uIFRoZSBjdXJyZW50IGdyaWQgZGltZW5zaW9uXHJcbiAgICAgKiBAcmV0dXJucyB7R3JpZERpbWVuc2lvbn0gdGhlIG5leHQgZGVzaXJlZCBncmlkIGRpbWVuc2lvblxyXG4gICAgICovXHJcbiAgICBjb25zdCBzZWxlY3ROZXh0SGVpZ2h0ID0gKGRpbWVuc2lvbikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGhlaWdodE5hbWVzID0gR1JJRF9JVEVNLkhFSUdIVFMuTEFCRUxTO1xyXG4gICAgICAgIGNvbnN0IGlkeCA9IF8uaW5kZXhPZihoZWlnaHROYW1lcywgZGltZW5zaW9uLmhlaWdodCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJz4gZm91bmQgaW5kZXgnLCBpZHgsIGhlaWdodE5hbWVzKTtcclxuICAgICAgICBjb25zdCBuZXh0SGVpZ2h0ID0gaWR4ID49IGhlaWdodE5hbWVzLmxlbmd0aCAtIDEgPyBoZWlnaHROYW1lc1swXSA6IGhlaWdodE5hbWVzW2lkeCArIDFdO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCc+IG5leHQgaGVpZ2h0JywgbmV4dEhlaWdodCwgaGVpZ2h0TmFtZXNbbmV4dEhlaWdodF0pO1xyXG4gICAgICAgIHJldHVybiBfLmRlZmF1bHRzKHtcclxuICAgICAgICAgICAgaGVpZ2h0OiBuZXh0SGVpZ2h0XHJcbiAgICAgICAgfSwgZGltZW5zaW9uKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXNpemUgdGhlIHRpbGUgdG8gdGhlIG5leHQgaGVpZ2h0IGluIHRoZSBjeWxlIG9mIGhlaWdodHNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdGhhdCBzaG91bGQgYmUgcmVzaXplZFxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGluY3JlbWVudEdyaWRJdGVtSGVpZ2h0ID0gKGVsZW1lbnQpID0+IHtcclxuICAgICAgICBjb25zdCBjdXJyU2l6ZSA9IGdldFRpbGVEaW1lbnNpb25zKGVsZW1lbnQpO1xyXG4gICAgICAgIGNvbnN0IG5leHRTaXplID0gc2VsZWN0TmV4dEhlaWdodChjdXJyU2l6ZSk7XHJcbiAgICAgICAgcmV0dXJuIGdyaWREb20uc3dhcENsYXNzZXMoZWxlbWVudCwgZm9ybWF0SGVpZ2h0KGN1cnJTaXplLmhlaWdodCksIGZvcm1hdEhlaWdodChuZXh0U2l6ZS5oZWlnaHQpKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW0gVGhlIGVsZW1lbnQgdGhhdCBzaG91bGQgYmUgcmVzaXplZFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlc2lyZWRIZWlnaHQgVGhlIGRlc2lyZWQgcGl4ZWwgaGVpZ2h0IG9mIHRoZSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHNldEJlc3RIZWlnaHQgPSAoZWxlbSwgZGVzaXJlZEhlaWdodCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZvdW5kSGVpZ2h0ID0gXy5maW5kKEdSSURfSVRFTS5IRUlHSFRTLlBBSVJTLCBoID0+IGgudmFsID49IGRlc2lyZWRIZWlnaHQpO1xyXG4gICAgICAgIGNvbnN0IGJlc3RIZWlnaHQgPSBmb3VuZEhlaWdodCA/IGZvdW5kSGVpZ2h0IDogXy5sYXN0KEdSSURfSVRFTS5IRUlHSFRTLlBBSVJTKTtcclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gZ2V0VGlsZURpbWVuc2lvbnMoZWxlbSk7XHJcbiAgICAgICAgcmV0dXJuIGdyaWREb20uc3dhcENsYXNzZXMoZWxlbSwgZm9ybWF0SGVpZ2h0KGN1cnJlbnQuaGVpZ2h0KSwgZm9ybWF0SGVpZ2h0KGJlc3RIZWlnaHQubmFtZSkpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldFRpbGVEaW1lbnNpb25zLFxyXG4gICAgICAgIGluY3JlbWVudEdyaWRJdGVtSGVpZ2h0LFxyXG4gICAgICAgIHNldEJlc3RIZWlnaHRcclxuICAgIH07XHJcbn0pOyJdfQ==
