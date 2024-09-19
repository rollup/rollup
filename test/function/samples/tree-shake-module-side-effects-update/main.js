import { direct, indirect } from './dep.js';
assert.ok(direct ? true : false, 'direct');
assert.ok(indirect ? true : false, 'indirect');
