'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var foo = _interopDefault(require('../foo'));

assert.equal( foo, 42 );
