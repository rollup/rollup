'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./generated-chunk.js');
require('./generated-chunk2.js');

const inlined = Promise.resolve(require('./generated-chunk.js'));
const separate = Promise.resolve(require('./generated-chunk2.js'));

exports.inlined = inlined;
exports.separate = separate;
