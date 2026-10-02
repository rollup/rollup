'use strict';

var shared = require('./generated-shared.js');
var exclusive = require('./generated-exclusive.js');

const m = shared.shared + exclusive.exclusive;

exports.m = m;
