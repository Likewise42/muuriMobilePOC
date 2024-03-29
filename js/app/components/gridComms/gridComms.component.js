"use strict";

define(['./gridComms.controller'], function (GridCommsController) {
  'use strict';

  return angular.module('muuridemo.components.gridCommsComponent', []).controller(GridCommsController.controllerName, GridCommsController).component('gridComms', {
    template: '',
    controller: GridCommsController.controllerName,
    require: {
      grid: '^muuriGrid'
    }
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL2NvbXBvbmVudHMvZ3JpZENvbW1zL2dyaWRDb21tcy5jb21wb25lbnQuanMiXSwibmFtZXMiOlsiZGVmaW5lIiwiR3JpZENvbW1zQ29udHJvbGxlciIsImFuZ3VsYXIiLCJtb2R1bGUiLCJjb250cm9sbGVyIiwiY29udHJvbGxlck5hbWUiLCJjb21wb25lbnQiLCJ0ZW1wbGF0ZSIsInJlcXVpcmUiLCJncmlkIl0sIm1hcHBpbmdzIjoiOztBQUFBQSxNQUFNLENBQUMsQ0FBQyx3QkFBRCxDQUFELEVBQTZCLFVBQVNDLG1CQUFULEVBQTZCO0FBQzVEOztBQUVBLFNBQU9DLE9BQU8sQ0FBQ0MsTUFBUixDQUFlLHlDQUFmLEVBQTBELEVBQTFELEVBQ0ZDLFVBREUsQ0FDU0gsbUJBQW1CLENBQUNJLGNBRDdCLEVBQzZDSixtQkFEN0MsRUFFRkssU0FGRSxDQUVRLFdBRlIsRUFFcUI7QUFDcEJDLElBQUFBLFFBQVEsRUFBRSxFQURVO0FBRXBCSCxJQUFBQSxVQUFVLEVBQUVILG1CQUFtQixDQUFDSSxjQUZaO0FBR3BCRyxJQUFBQSxPQUFPLEVBQUM7QUFDSkMsTUFBQUEsSUFBSSxFQUFFO0FBREY7QUFIWSxHQUZyQixDQUFQO0FBU0gsQ0FaSyxDQUFOIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKFsnLi9ncmlkQ29tbXMuY29udHJvbGxlciddLCBmdW5jdGlvbihHcmlkQ29tbXNDb250cm9sbGVyKXtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICByZXR1cm4gYW5ndWxhci5tb2R1bGUoJ211dXJpZGVtby5jb21wb25lbnRzLmdyaWRDb21tc0NvbXBvbmVudCcsIFtdKVxyXG4gICAgICAgIC5jb250cm9sbGVyKEdyaWRDb21tc0NvbnRyb2xsZXIuY29udHJvbGxlck5hbWUsIEdyaWRDb21tc0NvbnRyb2xsZXIpXHJcbiAgICAgICAgLmNvbXBvbmVudCgnZ3JpZENvbW1zJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJycsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEdyaWRDb21tc0NvbnRyb2xsZXIuY29udHJvbGxlck5hbWUsXHJcbiAgICAgICAgICAgIHJlcXVpcmU6e1xyXG4gICAgICAgICAgICAgICAgZ3JpZDogJ15tdXVyaUdyaWQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxufSk7Il19
