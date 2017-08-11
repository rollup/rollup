'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var foo = _interopDefault(require('https://unpkg.com/foo'));

assert.equal( foo, 42 );
