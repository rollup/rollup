'use strict';

var lib = {};

console.log('side-effect', lib);

const component = Promise.resolve().then(function () { return require('./generated-component.js'); }).then(function (n) { return n.component; });

exports.component = component;
exports.lib = lib;
