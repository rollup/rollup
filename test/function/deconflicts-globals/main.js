import { Number } from './foo';
import bar from './bar';

assert.equal( Number, 42 );
assert.notEqual( bar(), Number );
