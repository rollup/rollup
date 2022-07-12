'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var a = require('a');
var Test$1 = require('b');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var Test__default = /*#__PURE__*/_interopDefaultLegacy(Test$1);

const Test = () => {
  console.log(a.Test);
};

const Test1 = () => {
  console.log(Test__default.default);
};

exports.Test = Test;
exports.Test1 = Test1;
