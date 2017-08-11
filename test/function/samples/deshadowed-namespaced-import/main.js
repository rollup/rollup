import { ns } from './foo.js';

assert.equal((() => {
	function foo() {
		return ns.foo();
	}

	return foo();
})(), 42);

