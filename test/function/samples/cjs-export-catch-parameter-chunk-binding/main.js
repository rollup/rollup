import { a as imported } from './dep.js';

export var a = 'outer';
a = 'changed';

try {
	throw 0;
} catch (a) {
	var a = 1;
	var a;
}

assert.equal(imported, 1);
