'use strict';

var broken = require('./generated-broken.js');
var foo = require('./generated-foo.js');

foo.foo();
broken.broken();
