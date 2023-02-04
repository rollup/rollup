const assert = require('node:assert');
const rollup = require('../../dist/rollup');
const { executeBundle, loader } = require('../utils.js');

describe('acorn plugins', () => {
	it('injects plugins passed in acornInjectPlugins', async () => {
		let pluginAInjected = false;
		let pluginBInjected = false;

		const bundle = await rollup.rollup({
			input: 'x.js',
			plugins: [loader({ 'x.js': `export const foo = 42` })],
			acornInjectPlugins: [
				function pluginA(Parser) {
					assert.equal(typeof Parser.parse, 'function');
					return class extends Parser {
						readToken(code) {
							pluginAInjected = true;
							super.readToken(code);
						}
					};
				},
				function pluginB(Parser) {
					assert.equal(typeof Parser.parse, 'function');
					return class extends Parser {
						readToken(code) {
							pluginBInjected = true;
							super.readToken(code);
						}
					};
				}
			]
		});
		const result = await executeBundle(bundle);
		assert.equal(result.foo, 42);
		assert(
			pluginAInjected,
			'A plugin passed via acornInjectPlugins should inject itself into Acorn.'
		);
		assert(
			pluginBInjected,
			'A plugin passed via acornInjectPlugins should inject itself into Acorn.'
		);
	});
});
