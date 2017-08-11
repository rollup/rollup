import * as helpers from './helpers.js';
import foo from './foo.js';
import bar from './bar.js';

assert.equal( helpers.typeof( foo ), 'function' );
assert.equal( helpers.typeof( bar ), 'function' );
assert.equal( foo( 1 ), 'number' );
assert.equal( bar( 2 ), 'number' );
