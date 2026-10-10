const assert = require('node:assert/strict');

let execute;
const events = [];

module.exports = defineTest({
	description: 'awaits disposal from top-level await using in System output',
	minNodeVersion: 24,
	options: { output: { format: 'system' } },
	context: {
		System: {
			register(dependencies, declaration) {
				({ execute } = declaration());
			}
		},
		track(event) {
			events.push(event);
		}
	},
	async exports() {
		const completion = execute();
		assert.ok(completion instanceof Promise);
		await completion;
		assert.deepEqual(events, ['block', 'body', 'module']);
	}
});
