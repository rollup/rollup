'use strict';

require('./generated-index.js');
var dep = require('./generated-dep.js');
require('external');

console.log(dep.reexported);
