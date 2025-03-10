import bar from './dep.js';
let mutated = false;
const {
	[(() => {
		mutated = true;
		return 'Foo';
	})()]: Foo
} = { Foo: true };
assert.ok(mutated);
assert.deepStrictEqual(bar, { ok: true });
