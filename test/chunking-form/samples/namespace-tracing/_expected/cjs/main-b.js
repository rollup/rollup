'use strict';

var broken = require('./generated-broken.js');
var foo = require('./generated-foo.js');
var bar = require('./generated-bar.js');

foo.foo();
broken.broken();
bar.bar();
broken.broken();
