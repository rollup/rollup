'use strict';

var third = require('./third.js');

console.log('other');

console.log('main');

exports.bar = third.bar;
