import { foo } from './dep';

assert.equal(foo ? 1 : 2, 1);
