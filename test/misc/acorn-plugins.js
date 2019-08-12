const assert = require('assert');
const rollup = require('../../dist/rollup');
const { executeBundle, loader } = require('../utils.js');

describe('acorn plugins', () => {
	it('injects plugins passed in acornInjectPlugins', () => {
		let pluginAInjected = false;
		let pluginBInjected = false;

		return rollup
			.rollup({
				input: 'x.js',
				plugins: [loader({ 'x.js': `export default 42` })],
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
			})
			.then(executeBundle)
			.then(result => {
				assert.equal(result, 42);
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
});
