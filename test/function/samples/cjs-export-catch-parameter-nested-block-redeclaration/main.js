import { y } from './dep.js';

export var catchA = 0;
catchA = 1;
try {
	throw 0;
} catch (catchA) {
	{
		var catchA = 1;
		if (Math.random() < 2) var catchA = 2, k = 3;
	}
}
assert.equal(catchA, 1);
assert.equal(k, 3);
assert.equal(y, 'dep');

export { y };
