'use strict';

const lazy1 = Promise.resolve().then(function () { return require('./generated-foo_20bar.js'); });
const lazy2 = Promise.resolve().then(function () { return require('./generated-foo_bar.js'); });
const lazy3 = Promise.resolve().then(function () { return require('./generated-foo_E3_81_82bar.js'); });
const lazy4 = Promise.resolve().then(function () { return require('./generated-foo_E3_81bar.js'); });

exports.lazy1 = lazy1;
exports.lazy2 = lazy2;
exports.lazy3 = lazy3;
exports.lazy4 = lazy4;
