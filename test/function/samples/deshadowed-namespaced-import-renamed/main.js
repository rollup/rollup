import { foo as doFoo } from './foo.js';

assert.equal((() => {
	function foo() {
		return doFoo();
	}

	return foo();
})(), 42);

