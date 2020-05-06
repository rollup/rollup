'use strict';

var main = Promise.all([Promise.resolve().then(function () { return { 'default': require('./entry.js') }; }), Promise.resolve().then(function () { return require('./generated-other.js'); })]);

module.exports = main;
