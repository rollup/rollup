import { one as oneRenamed } from './one';
import { two } from './two';
import { three as threeRenamed } from './three';

assert.equal( oneRenamed, 1 );
assert.equal( two, 2 );
assert.equal( threeRenamed, 3 );
