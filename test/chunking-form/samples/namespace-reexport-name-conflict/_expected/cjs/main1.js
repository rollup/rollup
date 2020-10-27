'use strict';

var index = require('./generated-index.js');
require('./generated-dep.js');
require('external');

console.log(index.lib);
