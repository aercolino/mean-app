// See https://github.com/akatov/ng-layout

'use strict';

angular.module('myLayout', [])
  .directive('myLayout', [
    '$compile', '$timeout', '$templateCache', '$http',
    function ($compile, $timeout, $templateCache, $http) {
      var CONTENT = 'REPLACEMENT';
      var CONTENT_FOR = 'FOR';
      var YIELD = 'PLACEHOLDER';
      var YIELD_FOR = 'FOR';
      return {
        restrict: 'E',
        scope: { src: '=' },
        transclude: true,
        compile: function(elmt, attr, transclude) {
          var element = elmt;
          return function(scope, element, attrs) {
            $http.get(attr.src.replace(/^\//, ''), {cache: $templateCache}).success(function(html) {
              var dom = $compile(html)(scope.$parent);
              element.append(dom);
              transclude(scope.$parent, function(clone, innerScope) {
                var cs = {};
                angular.forEach(clone, function(c) {
                  var e = angular.element(c);
                  if (e.prop('tagName') == CONTENT) {
                    var a = e.attr(CONTENT_FOR);
                    if (!!a) {
                      cs[a] = $compile(e.html())(innerScope);
                    }
                  }
                });
                angular.forEach(element.find(YIELD), function(e) {
                  var el = angular.element(e);
                  var a = el.attr(YIELD_FOR);
                  var c = cs[a];
                  if (!!c) {
                    el.replaceWith(c);
                  }
                });
              });
            });
          }
        }
      }
    }
  ]);
