'use strict';

var foo = require('https://unpkg.com/foo');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var foo__default = /*#__PURE__*/_interopDefaultLegacy(foo);

assert.equal( foo__default['default'], 42 );
