import { a as b } from './dep.js';

export function f(a) {
	assert.equal(b, 1);
	{
		let a$1 = 1;
		assert.equal(a$1, 1);
		for (var a in { x: 1 });
		assert.equal(a$1, 1);
	}
	return a;
}

assert.equal(f('param'), 'x');
