import { y } from './dep.js';

export var a = 0;
a = 1;
try {
	throw 0;
} catch (a) {
	try {
		throw 1;
	} catch (b) {
		var a = 2;
		if (Math.random() < 2) var a = 3, k = 4;
		for (var a = 3, i = 0; i < 1; i++);
	}
}
assert.equal(a, 1);
assert.equal(k, 4);
assert.equal(y, 'dep');

export { y };
