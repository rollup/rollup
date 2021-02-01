import foo from './dep';
import { update } from './synthetic';

assert.strictEqual(foo, 'original');
update();
assert.strictEqual(foo, 'original');
