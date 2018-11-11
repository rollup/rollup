const assert = require('assert');
const rollup = require('../../dist/rollup');
const { executeBundle, loader } = require('../utils.js');

describe('acorn plugins', () => {
	// Acorn registers plugins globally per process. The tests in this suite
	// use unique plugin names to make sure each plugin is registered in its
	// proper test rather than in a test that ran earlier.

	it('injects plugins passed in acornInjectPlugins', () => {
		let pluginAInjected = false;
		let pluginBInjected = false;

		return rollup
			.rollup({
				input: 'x.js',
				plugins: [loader({ 'x.js': `export default 42` })],
				acornInjectPlugins: [
					function pluginA(acorn) {
						pluginAInjected = true;
						return acorn;
					},
					function pluginB(acorn) {
						pluginBInjected = true;
						return acorn;
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

	it('injected plugins are registered with Acorn only if acorn.plugins is set', () => {
		let pluginCRegistered = false;
		let pluginDRegistered = false;

		function pluginC(acorn) {
			acorn.plugins.pluginC = () => (pluginCRegistered = true);
			return acorn;
		}

		function pluginD(acorn) {
			acorn.plugins.pluginD = () => (pluginDRegistered = true);
			return acorn;
		}

		return rollup
			.rollup({
				input: 'x.js',
				plugins: [loader({ 'x.js': `export default 42` })],
				acorn: {
					plugins: {
						pluginC: true
					}
				},
				acornInjectPlugins: [pluginC, pluginD]
			})
			.then(executeBundle)
			.then(result => {
				assert.equal(result, 42);
				assert.equal(
					pluginCRegistered,
					true,
					'A plugin enabled in acorn.plugins should register with Acorn.'
				);
				assert.equal(
					pluginDRegistered,
					false,
					'A plugin not enabled in acorn.plugins should not register with Acorn.'
				);
			});
	});

	it('throws if acorn.plugins is set and acornInjectPlugins is missing', () => {
		return rollup
			.rollup({
				input: 'x.js',
				plugins: [loader({ 'x.js': `export default 42` })],
				acorn: {
					plugins: {
						pluginE: true
					}
				}
			})
			.then(executeBundle)
			.then(() => {
				throw new Error('Missing expected error');
			})
			.catch(error => {
				assert.equal(error.message, "Plugin 'pluginE' not found");
			});
	});

	it('throws if acorn.plugins is set and acornInjectPlugins is empty', () => {
		return rollup
			.rollup({
				input: 'x.js',
				plugins: [loader({ 'x.js': `export default 42` })],
				acorn: {
					plugins: {
						pluginF: true
					}
				},
				acornInjectPlugins: []
			})
			.then(executeBundle)
			.then(() => {
				throw new Error('Missing expected error');
			})
			.catch(error => {
				assert.equal(error.message, "Plugin 'pluginF' not found");
			});
	});
});
