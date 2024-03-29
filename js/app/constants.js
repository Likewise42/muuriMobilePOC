"use strict";

define([], function () {
  return {
    LOG_LEVEL: {
      ALL: Number.POSITIVE_INFINITY,
      DEBUG: 5,
      INFO: 4,
      WARN: 3,
      ERROR: 2,
      FATAL: 1
    },
    GRID_EVENTS: {
      // A dashboard grid has initialized and is announcing itself
      INITIALIZED: 'Dashboard Grid Initialized',
      // The set { available-items } has changed
      SOURCE_ITEMS_CHANGED: 'Grid items source changed',
      // The set { placed-items } has changed, due to items removed from the set
      DISPLAYED_ITEMS_REMOVED: 'Displayed grid items removed',
      // The set { placed-items } has changed due to items added to the set
      DISPLAYED_ITEMS_ADDED: 'Displayed grid items added'
    },
    GRID_TYPES: {
      SOURCE_GRID: 'source-grid',
      DISPLAY_GRID: 'display-grid'
    },
    RELEASE: {
      VERSION: '2019.0103.1',
      DATE: '2019-01-03T17:00-0500'
    }
  };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL2NvbnN0YW50cy5qcyJdLCJuYW1lcyI6WyJkZWZpbmUiLCJMT0dfTEVWRUwiLCJBTEwiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIkRFQlVHIiwiSU5GTyIsIldBUk4iLCJFUlJPUiIsIkZBVEFMIiwiR1JJRF9FVkVOVFMiLCJJTklUSUFMSVpFRCIsIlNPVVJDRV9JVEVNU19DSEFOR0VEIiwiRElTUExBWUVEX0lURU1TX1JFTU9WRUQiLCJESVNQTEFZRURfSVRFTVNfQURERUQiLCJHUklEX1RZUEVTIiwiU09VUkNFX0dSSUQiLCJESVNQTEFZX0dSSUQiLCJSRUxFQVNFIiwiVkVSU0lPTiIsIkRBVEUiXSwibWFwcGluZ3MiOiI7O0FBQUFBLE1BQU0sQ0FBQyxFQUFELEVBQUssWUFBVTtBQUNqQixTQUFPO0FBQ0hDLElBQUFBLFNBQVMsRUFBRTtBQUNQQyxNQUFBQSxHQUFHLEVBQUVDLE1BQU0sQ0FBQ0MsaUJBREw7QUFFUEMsTUFBQUEsS0FBSyxFQUFFLENBRkE7QUFHUEMsTUFBQUEsSUFBSSxFQUFFLENBSEM7QUFJUEMsTUFBQUEsSUFBSSxFQUFFLENBSkM7QUFLUEMsTUFBQUEsS0FBSyxFQUFFLENBTEE7QUFNUEMsTUFBQUEsS0FBSyxFQUFFO0FBTkEsS0FEUjtBQVNIQyxJQUFBQSxXQUFXLEVBQUU7QUFDVDtBQUNBQyxNQUFBQSxXQUFXLEVBQUUsNEJBRko7QUFHVDtBQUNBQyxNQUFBQSxvQkFBb0IsRUFBRSwyQkFKYjtBQUtUO0FBQ0FDLE1BQUFBLHVCQUF1QixFQUFFLDhCQU5oQjtBQU9UO0FBQ0FDLE1BQUFBLHFCQUFxQixFQUFFO0FBUmQsS0FUVjtBQW1CSEMsSUFBQUEsVUFBVSxFQUFFO0FBQ1JDLE1BQUFBLFdBQVcsRUFBRSxhQURMO0FBRVJDLE1BQUFBLFlBQVksRUFBRTtBQUZOLEtBbkJUO0FBdUJIQyxJQUFBQSxPQUFPLEVBQUU7QUFDTEMsTUFBQUEsT0FBTyxFQUFFLGFBREo7QUFFTEMsTUFBQUEsSUFBSSxFQUFFO0FBRkQ7QUF2Qk4sR0FBUDtBQTRCSCxDQTdCSyxDQUFOIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKFtdLCBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBMT0dfTEVWRUw6IHtcclxuICAgICAgICAgICAgQUxMOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXHJcbiAgICAgICAgICAgIERFQlVHOiA1LFxyXG4gICAgICAgICAgICBJTkZPOiA0LFxyXG4gICAgICAgICAgICBXQVJOOiAzLFxyXG4gICAgICAgICAgICBFUlJPUjogMixcclxuICAgICAgICAgICAgRkFUQUw6IDFcclxuICAgICAgICB9LFxyXG4gICAgICAgIEdSSURfRVZFTlRTOiB7XHJcbiAgICAgICAgICAgIC8vIEEgZGFzaGJvYXJkIGdyaWQgaGFzIGluaXRpYWxpemVkIGFuZCBpcyBhbm5vdW5jaW5nIGl0c2VsZlxyXG4gICAgICAgICAgICBJTklUSUFMSVpFRDogJ0Rhc2hib2FyZCBHcmlkIEluaXRpYWxpemVkJyxcclxuICAgICAgICAgICAgLy8gVGhlIHNldCB7IGF2YWlsYWJsZS1pdGVtcyB9IGhhcyBjaGFuZ2VkXHJcbiAgICAgICAgICAgIFNPVVJDRV9JVEVNU19DSEFOR0VEOiAnR3JpZCBpdGVtcyBzb3VyY2UgY2hhbmdlZCcsXHJcbiAgICAgICAgICAgIC8vIFRoZSBzZXQgeyBwbGFjZWQtaXRlbXMgfSBoYXMgY2hhbmdlZCwgZHVlIHRvIGl0ZW1zIHJlbW92ZWQgZnJvbSB0aGUgc2V0XHJcbiAgICAgICAgICAgIERJU1BMQVlFRF9JVEVNU19SRU1PVkVEOiAnRGlzcGxheWVkIGdyaWQgaXRlbXMgcmVtb3ZlZCcsXHJcbiAgICAgICAgICAgIC8vIFRoZSBzZXQgeyBwbGFjZWQtaXRlbXMgfSBoYXMgY2hhbmdlZCBkdWUgdG8gaXRlbXMgYWRkZWQgdG8gdGhlIHNldFxyXG4gICAgICAgICAgICBESVNQTEFZRURfSVRFTVNfQURERUQ6ICdEaXNwbGF5ZWQgZ3JpZCBpdGVtcyBhZGRlZCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIEdSSURfVFlQRVM6IHtcclxuICAgICAgICAgICAgU09VUkNFX0dSSUQ6ICdzb3VyY2UtZ3JpZCcsXHJcbiAgICAgICAgICAgIERJU1BMQVlfR1JJRDogJ2Rpc3BsYXktZ3JpZCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBSRUxFQVNFOiB7XHJcbiAgICAgICAgICAgIFZFUlNJT046ICcyMDE5LjAxMDMuMScsXHJcbiAgICAgICAgICAgIERBVEU6ICcyMDE5LTAxLTAzVDE3OjAwLTA1MDAnXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7Il19
