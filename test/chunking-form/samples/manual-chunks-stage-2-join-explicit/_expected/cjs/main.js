'use strict';

var manual = require('./generated-manual.js');
require('./generated-x.js');

Promise.resolve().then(function () { return require('./generated-x.js'); }).then(n => console.log(n.x, manual.m));
