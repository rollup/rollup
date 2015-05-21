import value from './foo';
import { change } from './foo';

assert.equal(value, 42);
change();
assert.equal( value, 42, 'default export should not be bound' );
