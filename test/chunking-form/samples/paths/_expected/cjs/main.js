'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var changedOld_js = _interopDefault(require('https://external-url.com/changed-new.js'));
var unchanged_js = _interopDefault(require('https://external-url.com/unchanged.js'));
var externalChangedOld = _interopDefault(require('external-changed-new'));
var externalUnchanged = _interopDefault(require('external-unchanged'));
var externalRelativeChangedOld = _interopDefault(require('../external-relative-changed-new'));
var externalRelativeUnchanged = _interopDefault(require('../external-relative-unchanged'));
var __chunk_1 = require('./internal-changed-new');
var __chunk_2 = require('./internal-unchanged.js');



exports.externalUrlChangedOld = changedOld_js;
exports.externalUrlUnchanged = unchanged_js;
exports.externalChangedOld = externalChangedOld;
exports.externalUnchanged = externalUnchanged;
exports.externalRelativeChangedOld = externalRelativeChangedOld;
exports.externalRelativeUnchanged = externalRelativeUnchanged;
exports.internalChangedOld = __chunk_1.default;
exports.internalUnchanged = __chunk_2.default;
