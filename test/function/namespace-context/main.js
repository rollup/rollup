import * as foo from './foo.js';

assert.notStrictEqual( foo[ 'self' ](), foo );
