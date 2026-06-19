'use strict';

var dep1 = require('./.env.local');
var dep2 = require('./.env2.local');

console.log(dep1.num + dep2.num);
