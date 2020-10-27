'use strict';

var foo = require('./generated-foo.js');
var broken = require('./generated-broken.js');

foo.foo();
broken.broken();
