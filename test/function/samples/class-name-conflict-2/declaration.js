import { foo as foo$ } from './foo.js';

{
	class foo extends foo$ {
		static test() {
			assert.ok(foo.base);
		}
	}

	assert.strictEqual(foo.name, 'foo');
	foo.test();
}
