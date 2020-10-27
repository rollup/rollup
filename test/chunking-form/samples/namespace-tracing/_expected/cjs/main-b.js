'use strict';

var foo = require('./generated-foo.js');
var bar = require('./generated-bar.js');
var broken = require('./generated-broken.js');

foo.foo();
broken.broken();
bar.bar();
broken.broken();
