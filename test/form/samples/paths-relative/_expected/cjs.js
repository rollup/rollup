'use strict';

var foo = require('../foo');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

var foo__default = /*#__PURE__*/_interopDefault(foo);

assert.equal( foo__default['default'], 42 );
