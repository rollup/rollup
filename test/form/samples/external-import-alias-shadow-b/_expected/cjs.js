'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var bar = _interopDefault(require('bar1'));
var bar$1 = _interopDefault(require('bar2'));

function foo() {
    this.bar = bar$1;
}

console.log(bar);
console.log(foo);
