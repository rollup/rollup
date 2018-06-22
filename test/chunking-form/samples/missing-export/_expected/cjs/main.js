'use strict';

var dep = require('./dep.js');

dep.missingFn();
dep.x(dep.missingFn, dep.missingFn);
