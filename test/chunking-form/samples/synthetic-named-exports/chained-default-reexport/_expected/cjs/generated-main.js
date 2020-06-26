'use strict';

const lib = { named: { named: 42 } };

console.log('side-effect', lib.named);

console.log('side-effect', lib.named.named);

const component = Promise.resolve().then(function () { return require('./generated-component.js'); }).then(function (n) { return n.component; });

exports.component = component;
exports.lib = lib;
