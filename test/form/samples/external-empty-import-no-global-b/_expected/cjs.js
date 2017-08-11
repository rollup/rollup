'use strict';

require('babel-polyfill');
var other = require('other');

other.x();

var main = new WeakMap();

module.exports = main;
