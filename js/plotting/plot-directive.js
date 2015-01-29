define(['./module', 'd3'], function (directives, d3) {
    'use strict';
    directives.directive('plot', function () {
        console.log('plot directive loaded')
        /* Sets the options for the plot, such as axis locations, range, etc...//{{{
         */
        var setOptions = function (scope, opts) {
            if (opts) {
                scope.xDomain = opts.xDomain || [-1,1];
                scope.yDomain = opts.yDomain || [-1,1];
            }
            else {
                scope.xDomain = [-1,1];
                scope.yDomain = [-1,1];
            }
        };

        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                options: '=',
                data: '='
            },
            controller: ['$scope', function($scope) {

                // Things that need to be drawn
                var lines = [];

                $scope.drawAxes = function () {
                    var xAxis = d3.svg.axis()
                        .scale($scope.xScale)
                        .ticks(5)
                        .orient("bottom");
                    var yAxis = d3.svg.axis()
                        .scale($scope.yScale)
                        .ticks(5)
                        .orient("left");

                    // Draw the axes
                    $scope.svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0," + ($scope.height-$scope.padding) + ")")
                        .call(xAxis);
                    $scope.svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(" + $scope.padding + ",0)")
                        .call(yAxis);
                };
                
                $scope.drawPlot = function () {
                    var plotData = $scope.data || [[-6,-1],[6,1]];
                    // We want to clip the path to the drawing region. 
                    // However, clipping to close at the top makes part of the line
                    // disappear
                    var clip = $scope.svg.append("defs").append("clipPath")
                        .attr("id", "plotArea")
                        .append("rect")
                        .attr("id", "clip-rect")
                        .attr("x", $scope.padding)
                        .attr("y", 0)
                        .attr("width", $scope.width-$scope.padding*2)
                        .attr("height", $scope.height-$scope.padding)

                    var chartBody = $scope.svg.append("g")
                        .attr("clip-path", "url(#plotArea)")

                    // This next bit creates an svg path generator
                    var pathGen = d3.svg.line()
                        .x(function(d) {return $scope.xScale(d[0]); })
                        .y(function(d) {return $scope.yScale(d[1]); })
                        .interpolate("linear");

                    // Now, the plot is actually added to the svg
                    $scope.plot = chartBody.append("path")
                        .attr("d", pathGen(plotData))
                        .attr("stroke", "blue")
                        .attr("stroke-width", 2)
                        .attr("fill", "none");
                };


                $scope.render = function() {
                    $scope.svg.selectAll('*').remove();
                    var p = $scope.padding;
                    var w = $scope.width;
                    var h = $scope.height;

                    // Set up the scales
                    $scope.xScale = d3.scale.linear()
                        .domain($scope.xDomain).range([p,w-p]);
                    $scope.yScale = d3.scale.linear()
                        .domain($scope.yDomain).range([h-p,p]);

                    $scope.drawAxes();
                    $scope.drawPlot();
                    lines.forEach(function(line) {
                        $scope.drawLine(line);
                    });
                };

                /* Draw a line in the svg element
                 */
                $scope.drawLine = function(line) {
                    var sw = line.strokeWidth || 1;
                    var color = line.color || 'black';
                    var start = line.start;
                    var end = line.end;
                    var drawnLine = $scope.svg.append("line")
                            .attr("x1", $scope.xScale(start[0]))
                            .attr("y1", $scope.yScale(start[1]))
                            .attr("x2", $scope.xScale(end[0]))
                            .attr("y2", $scope.yScale(end[1]))
                            .attr('stroke-width', sw)
                            .attr('stroke', color)
                    return drawnLine;
                };
                
                /* The following sets up watches for data, and config
                 */
                $scope.$watch('options', function() {
                    setOptions($scope, $scope.options);
                    $scope.render();
                }, true);
                $scope.$watch('data', function() {
                    $scope.render();
                });

                /* We create an apply function (so it can be removed),
                 * and force an $apply on resize events, triggering 
                 * the `$watch`s in the `link` function.
                 */
                var apply = function () {$scope.$apply();};
                window.addEventListener('resize', apply);

                /* Controller methods for children to add drawn elements to the SVG
                 */
                this.addLine = function (line) {
                    lines.push(line)
                };

            }],
            link: function(scope, elm, attrs) {

                console.log('linking plot directive');

                // TODO read plot options
                scope.padding = 30;
                scope.svg = d3.select(elm[0])
                        .append("svg")
                        .attr("height", '100%')
                        .attr("width", '100%');
                
                scope.width = elm[0].offsetWidth - scope.padding;
                scope.height = elm[0].offsetHeight - scope.padding;

                scope.$watch(function () {
                    return elm[0].offsetWidth;
                }, function () {
                    scope.width = elm[0].offsetWidth - scope.padding;
                    scope.height = elm[0].offsetHeight - scope.padding;
                    scope.render();
                });
                scope.$watch(function () {
                    return elm[0].offsetHeight;
                }, function () {
                    scope.width = elm[0].offsetWidth - scope.padding;
                    scope.height = elm[0].offsetHeight - scope.padding;
                    scope.render();
                });

            },
            template: '<div ng-transclude></div>',//}}}
        };
    });
});
