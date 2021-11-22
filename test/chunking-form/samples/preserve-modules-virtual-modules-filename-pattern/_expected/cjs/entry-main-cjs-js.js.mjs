'use strict';

var _virtualModule = require('./_virtual/entry-_virtualModule-cjs-.mjs');
var _virtualWithExt = require('./_virtual/entry-_virtualWithExt-cjs-js.js.mjs');
var _virtualWithAssetExt = require('./_virtual/entry-_virtualWithAssetExt-cjs-str.str.str.mjs');

assert.equal(_virtualModule.virtual, 'Virtual!');
assert.equal(_virtualWithExt.virtual2, 'Virtual2!');
assert.equal(_virtualWithAssetExt.virtual3, 'Virtual3!');
