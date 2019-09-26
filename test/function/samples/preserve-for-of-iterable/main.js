import { zeroToFive } from './iterables';
import { iterate } from './loops';

assert.equal(global.foo, undefined);
iterate(zeroToFive);
assert.equal(global.foo, 5);
