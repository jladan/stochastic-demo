define(['./module', 'stochastics'], function (controllers, stoch) {
    'use strict';
    controllers.controller('simCtrl', ['$scope', function ($scope) {
        var dorbit = function (x,t,c) {
            return [ c[0] * x[1], 
                     c[0] * (x[0]-x[0]*x[0]*x[0])];
        }
        
        var dwell = function (x,t,c) {
            return [ c[0] * (x[0] - x[0]*x[0]*x[0]),
                     - c[0] * (x[1])];
        }

        var dconstant = function (x,t,c) {
            return [ c[0], 
                     c[0]];
        }

        /* plot settings */
        $scope.plotConfig = {
            xDomain: [-2,2],
            yDomain: [-2,2],
        }
        //dummy data
        $scope.plotData = [ [-4,-2], [-2,1], [0,-1], [2,2], [4,-2]];

        // default data
        $scope.initial = [0.1, 0.1];
        $scope.sigma = 1;
        $scope.correlation = 0.01;
        $scope.tfinal = 40;
        $scope.dt = .01;
        $scope.pA = [1.0];
        $scope.pD = [0.1];

        // Methods
        $scope.methods = [
            {label: 'Euler-Maruyama', value: 'euler'},
            {label: 'Milstein', value: 'milstein'},
            {label: 'Coloured', value: 'colour'},
        ];
        $scope.method = $scope.methods[0];

        /* Get the phase space from a simulation */
        var extractPhase = function (sol) {
            var t, N, x, y, d;
            t = sol[0];
            N = t.length;
            x = sol[1].subarray(0,N);
            y = sol[1].subarray(N,2*N);
            d = [];
            for (i=0; i<N; i++) {
                d[i] = [ x[i],y[i] ];
            }
            return d;
        };

        /* Simulation runner */
        $scope.runSimulation = function () {
            var sol;
            if ($scope.method.value === 'euler')
                sol = stoch.euler(dorbit, dconstant, $scope.initial, $scope.dt, 
                        $scope.tfinal, $scope.pA, $scope.pD);
            else if ($scope.method.value === 'milstein')
                sol = stoch.euler(dorbit, dconstant, $scope.initial, $scope.dt, 
                        $scope.tfinal, $scope.pA, $scope.pD);
            else
                sol = stoch.colour(dorbit, dconstant, $scope.sigma, $scope.correlation,
                        $scope.initial, $scope.dt, $scope.tfinal, $scope.pA, $scope.pD);
            $scope.plotData = extractPhase(sol);
        };
    }]);
});
