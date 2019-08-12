'use strict';

var constants = require('./generated-constants.js');

var lazy = () => constants.v1;

exports.default = lazy;
