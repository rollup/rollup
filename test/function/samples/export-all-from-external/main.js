import { dirname, isRelative } from './path-plus.js';

assert.equal( dirname( 'foo/bar' ), 'foo' );
assert.ok( isRelative( './foo' ) );
