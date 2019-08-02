'use strict';

var dep = require('./generated-chunk.js');
var buildStart = require('./custom/build-start-chunk.js');

console.log(buildStart.id);

console.log('main', dep.value);
