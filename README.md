# Stochastic Demo

This is mainly a simple template for running a stochastic simulation demo.

## Installation

The demo has a few dependencies, notably [AngularJS](http://angularjs.org) and [RequireJS](http://requirejs.org). They can be installed using [Bower](http://bower.io) with the command

    bower install

If missing, bower can be installed with 

    npm install -g bower

You may need sudo privileges to install bower globally. Finally, if [npm](https://www.npmjs.com/) is missing, you'll have to figure it out yourself, because it's different depending on platform.

## Customization
TBD

## Notable files
All of the necessary angular modules are specified in `js/app.js`. The main controller is in `js/controllers/double-well-ctrl.js`, which is loaded via `js/controllers/index.js`. The plotting directives and controllers are in `js/plotting/` and the stochastics library is `js/stochastics.js` (for now).

## Acknowledgments
The organization of source code is based on this [StarterSquid post](http://www.startersquad.com/blog/angularjs-requirejs/).
