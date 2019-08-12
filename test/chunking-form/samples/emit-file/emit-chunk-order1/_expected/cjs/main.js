'use strict';

var dep = require('./generated-dep.js');
var emitted = require('./generated-emitted.js');

console.log(emitted.id);

console.log('main', dep.value);
