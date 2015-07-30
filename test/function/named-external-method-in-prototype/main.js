// XXX: it has to be an imported module, otherwise it compiles and fails at
// runtime
import Foo from './foo.js';

assert.equal( new Foo(), 42 );
