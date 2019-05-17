'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./generated-inlined.js');
require('./generated-separate.js');

const inlined = Promise.resolve(require('./generated-inlined.js'));
const separate = Promise.resolve(require('./generated-separate.js'));

exports.inlined = inlined;
exports.separate = separate;
