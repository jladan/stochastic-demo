/**
 * loads sub modules and wraps them up into the main module
 * this should be used for top-level module definitions only
 */
define([
    'angular',
    './controllers/index',
    './plotting/index',
], function (angular) {
    'use strict';

    console.log("loading app");
    return angular.module('app', [
        'app.controllers',
        'plotting',
    ]);
});
