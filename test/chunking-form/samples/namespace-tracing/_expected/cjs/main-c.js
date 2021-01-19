'use strict';

var bar = require('./generated-bar.js');
var broken = require('./generated-broken.js');

bar.bar();
broken.broken();
