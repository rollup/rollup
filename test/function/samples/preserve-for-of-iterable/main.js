import { zeroToFive, dirty } from './iterables';
import { iterate } from './loops';

assert.equal(dirty, undefined);
iterate(zeroToFive);
assert.equal(dirty, 5);
