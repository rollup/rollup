'use strict';

var foo = require('../foo');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

foo = _interopDefault(foo);

assert.equal( foo, 42 );
