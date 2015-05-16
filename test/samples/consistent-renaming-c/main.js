import One from './one';
import two from './two';

assert.equal( One(), 1 );
assert.equal( two(), 2 );
assert.equal( One.two(), 99 );
