import * as foo from './foo.js';

assert.equal( true ? foo.bar : foo.baz, 42 );
