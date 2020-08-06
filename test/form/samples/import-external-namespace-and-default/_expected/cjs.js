'use strict';

var foo = require('foo');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var foo__default = /*#__PURE__*/_interopDefaultLegacy(foo);

console.log( foo.bar );

console.log( foo__default['default'] );
