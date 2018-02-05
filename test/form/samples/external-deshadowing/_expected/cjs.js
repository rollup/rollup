'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var a = require('a');
var Test = _interopDefault(require('b'));

const Test$1 = () => {
  console.log(a.Test);
};

const Test1 = () => {
  console.log(Test);
};

exports.Test = Test$1;
exports.Test1 = Test1;
