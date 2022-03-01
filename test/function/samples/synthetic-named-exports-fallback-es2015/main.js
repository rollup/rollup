import * as fromNull from './null';
import * as fromString from './string';
import * as fromArray from './array';
import * as fromInherited from './inherited';

const expectedNs = { __proto__: null, foo: 'bar' };
Object.defineProperty(expectedNs, Symbol.toStringTag, { value: 'Module' });

assert.deepStrictEqual(fromNull, expectedNs);
assert.deepStrictEqual(fromString, expectedNs);
assert.deepStrictEqual(fromArray, expectedNs);
assert.deepStrictEqual(fromInherited, expectedNs);
