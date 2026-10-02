'use strict';

var a = require('./generated-a.js');
var b = require('./generated-b.js');

const x = 'x' + a.a + b.b;

exports.x = x;
