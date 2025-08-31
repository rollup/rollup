'use strict';

var main = require('./main.js');
var dynamic2 = require('./generated-dynamic2.js');
var dynamic3 = require('./generated-dynamic3.js');

const DYNAMIC_1 = 'DYNAMIC_1';

exports.DEP = main.DEP;
exports.DYNAMIC_2 = dynamic2.DYNAMIC_2;
exports.DYNAMIC_3 = dynamic3.DYNAMIC_3;
exports.DYNAMIC_1 = DYNAMIC_1;
