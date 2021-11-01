import * as fromNull from './null';
import * as fromString from './string';
import * as fromArray from './array';
import * as fromInherited from './inherited';

assert.deepStrictEqual(fromNull, { __proto__: null, foo: 'bar' });
assert.deepStrictEqual(fromString, { __proto__: null, foo: 'bar' });
assert.deepStrictEqual(fromArray, { __proto__: null, foo: 'bar' });
assert.deepStrictEqual(fromInherited, { __proto__: null, foo: 'bar' });
