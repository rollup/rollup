'use strict';

var lib2 = require('./generated-lib2.js');

const lib1 = 'lib1';
console.log(`${lib1} imports ${lib2.lib2}`);

exports.lib1 = lib1;
