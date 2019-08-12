'use strict';

var dep = require('./generated-dep.js');
require('external');
require('./generated-index.js');

console.log(dep.reexported);
