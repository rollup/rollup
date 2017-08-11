import a from './foo';
import { change } from './foo';

assert.equal( a, 42 );
change();
assert.equal( a, 43, 'export as default should be bound' );
