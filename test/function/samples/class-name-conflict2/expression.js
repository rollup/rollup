import { bar as bar$ } from './bar.js';

{
	let bar = class extends bar$ {
		static test() {
			assert.ok(bar.base);
		}
	};

	assert.strictEqual(bar.name, 'bar');
	bar.test();
}
