define(['htmlregistry'],function(htmlregistry){ return ['$templateCache', function($templateCache){   'use strict';

  $templateCache.put(''+htmlregistry.paths['muuri-demo']+'/app/components/bulldozer/bulldozer.template.html',
    '<div class=bulldozer ng-show=$ctrl.display><button ng-click=$ctrl.hideButton()>Hide the Bulldozer</button><muuri-grid can-edit=false grid-name=demo-main grid-type={{$ctrl.gridType}}><bulldozer-data></bulldozer-data><grid-comms></grid-comms></muuri-grid></div>'
  );


  $templateCache.put(''+htmlregistry.paths['muuri-demo']+'/app/components/demoRoot/demoRoot.template.html',
    '<div class=page-content><header class=page-header><demo-header></demo-header></header><nav><a href=# ng-click=$ctrl.togglePercentUnload() class=toggleable ng-class="{selected: $ctrl.unload}">Load 70% of Tiles</a> <a href=# ng-click=$ctrl.toggleStaggerLoad() class=toggleable ng-class="{selected: $ctrl.stagger}">Stagger Tile Load</a> <a href=# ng-click=$ctrl.reloadView() title="Reload current demo" ng-disabled="$ctrl.currentState.name === loadingDemo"><span class=rot-90>&#x21bb;</span> Reload current demo</a></nav><main ng-include=$ctrl.currentState.templateUrl></main><bulldozer></bulldozer></div>'
  );


  $templateCache.put(''+htmlregistry.paths['muuri-demo']+'/app/components/demoRoot/templates/main.html',
    '<muuri-grid can-edit=true grid-name=demo-main grid-type={{$ctrl.gridType}}><grid-user-data></grid-user-data><grid-comms></grid-comms></muuri-grid>'
  );


  $templateCache.put(''+htmlregistry.paths['muuri-demo']+'/app/components/demoRoot/templates/reloading.html',
    '<div class=demo__loading><div class=demo__progress><div class=demo__progress-bar></div></div><div class=demo__loading-message>Reloading your demo...</div></div>'
  );


  $templateCache.put(''+htmlregistry.paths['muuri-demo']+'/app/components/demoRoot/templates/tile-demo.html',
    '<out-of-scope version=R1 feature="2- and 3-column grid items" explanation="\'This page demonstrates issues in projected future functionality so that interested stakeholders can be aware of issues in the selected grid layout software.\'"><div class=colSpanDemo><muuri-grid can-edit=true><demo-data></demo-data></muuri-grid><div class=instructions><h3>These are instructions how to create potentially problematic Muuri interactions</h3><h5>First Problem</h5><ol><li>Drag Tile 2 slowly to left over tile 1</li><li>Drop Tile 2 to the left of tile 1 on the top row</li><li>Begin to Drag Tile 2 again</li><li>Drag it above the grid, and around to these directions</li><li>Slowly Drag it from right to left over Tile 1 again back to where it started</li></ol><h5>Second Problem</h5><ol><li>Drag Tile 3 onto the area of tile 6 or tile 7</li><li>The tiles 4, 5, and 6 will shift over to the left.</li><ul><li>The tiles will not interact or change at all until you move over tile 4 or above tile 5</li><li>You can not place a large tile below two small tiles if there is a two column tile below it</li></ul></ol><h5>Third Problem</h5><ol><li>Drag Tile 11 down to the left side of Tile 12</li><li>Slowly Drag straight down</li></ol><h5>Fourth Problem</h5><ol><li>Drag Tile 9 slowly upwards over Tile 7</li><li>Drag Tile 9 back slowly downward over Tile 7 back to its original spot</li></ol></div></div></out-of-scope>'
  );


  $templateCache.put(''+htmlregistry.paths['muuri-demo']+'/app/components/header/header.template.html',
    '<h1>{{$ctrl.title}} <small>version {{$ctrl.releaseName}} &mdash; released {{$ctrl.releaseDate | date : \'shortDate\'}}</small></h1>'
  );


  $templateCache.put(''+htmlregistry.paths['muuri-demo']+'/app/components/muuriGrid/muuriGrid.template.html',
    '<div class=dashboard__root><a href=# ng-click=$ctrl.toggleEdit() ng-if=$ctrl.canEdit>{{$ctrl.editButtonText}}</a><div class=dashboard__grid></div><div class=dashboard__components ng-transclude></div></div>'
  );


  $templateCache.put(''+htmlregistry.paths['muuri-demo']+'/app/components/outOfScope/outOfScope.template.html',
    '<div class=outOfScope><h2>Out of scope features</h2><div class=outOfScope__message>{{$ctrl.feature}} are out of scope for <strong>Customizable Dashboard {{$ctrl.version}}</strong>.</div><div class="outOfScope__message --additional" ng-if=$ctrl.explanation ng-bind=$ctrl.explanation></div><button class=outOfScope__button ng-hide=$ctrl.accepted ng-click="$ctrl.accepted = true">Display Out Of Scope Content</button><div class=outOfScope__content ng-if=$ctrl.accepted ng-transclude></div></div>'
  );
}];});