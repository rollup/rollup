const assert = require('node:assert/strict');
const { setImmediate } = require('node:timers/promises');

let cleanupFinished = false;
let closeCalls = 0;

module.exports = defineTest({
	description: 'reports closeBundle errors when closing a successful build',
	options: {
		plugins: [
			{
				name: 'cleanup',
				async closeBundle(error) {
					assert.equal(error, undefined);
					closeCalls++;
					await setImmediate();
					cleanupFinished = true;
					this.error('cleanup failed');
				}
			}
		]
	},
	async bundle(bundle) {
		await assert.rejects(bundle.close(), {
			code: 'PLUGIN_ERROR',
			hook: 'closeBundle',
			message: '[plugin cleanup] cleanup failed',
			plugin: 'cleanup'
		});
		assert.ok(cleanupFinished);
		assert.ok(bundle.closed);
		await bundle.close();
		assert.equal(closeCalls, 1);
	}
});
