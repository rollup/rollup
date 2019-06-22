'use strict';

var main = Promise.all([new Promise(function (resolve) { resolve({ 'default': require('./entry.js') }); }), new Promise(function (resolve) { resolve(require('./generated-other.js')); })]);

module.exports = main;
