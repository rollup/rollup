const assert = require('node:assert/strict');

let execute;
const events = [];

module.exports = defineTest({
	// SWC reports the declarator start of using declarations in for-of heads at the keyword
	verifyAst: false,
	description: 'awaits disposal from loop-head await using in System output',
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
		assert.deepEqual(events, [
			'body',
			'disposed',
			'sync body',
			'sync disposed',
			'async body',
			'async disposed',
			'after'
		]);
	}
});
