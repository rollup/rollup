import bar from './dep.js';
let mutated = false;
const { Foo } = {
	get Foo() {
		mutated = true;
	}
};
assert.ok(mutated);
assert.deepStrictEqual(bar, { ok: true });
