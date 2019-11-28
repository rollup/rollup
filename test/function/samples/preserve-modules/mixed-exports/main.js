import lib1, { value1 } from './lib1';
import lib2 from './lib2';
import { value3 } from './lib3';

assert.equal(lib1, 42);
assert.equal(value1, 42);
assert.equal(lib2, 42);
assert.equal(value3, 42);

export const value = 42;
export default 42;
