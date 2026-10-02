'use strict';

var dep = require('./generated-dep.js');

console.log('main2', dep.value);

exports.reexported = dep.value;
