const assert = require('node:assert/strict');

const debuggerStatements = [];

module.exports = defineTest({
	description: 'parses a DebuggerStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						DebuggerStatement(node) {
							debuggerStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(debuggerStatements, [
			{
				type: 'DebuggerStatement',
				start: 0,
				end: 9
			}
		]);
	}
});
