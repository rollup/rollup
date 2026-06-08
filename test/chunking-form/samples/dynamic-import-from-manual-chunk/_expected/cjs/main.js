'use strict';

var dep1 = require('./generated-dep1.js');
require('./generated-manual.js');

console.log(dep1.dep1);
