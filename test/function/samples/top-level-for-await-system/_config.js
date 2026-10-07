const assert = require('node:assert/strict');

let execute;
const events = [];

module.exports = defineTest({
	description: 'executes top-level for-await loops asynchronously in System output',
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
		assert.deepEqual(events, [1, 2]);
	}
});
