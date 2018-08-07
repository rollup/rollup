const assert = require('assert');
const rollup = require('../../dist/rollup');

describe('cache', () => {
	let genPlugin;
	let resolveIdCalls;
	let loadCalls;
	let transformCalls;
	const expectedCode = `(function () {
	'use strict';

	console.log( 42 );

}());
`;
	beforeEach(() => {
		resolveIdCalls = [];
		loadCalls = [];
		transformCalls = [];
		genPlugin = (modules, i = 1) => ({
			name: 'test-plugin',
			cacheKey: `v${i}`,
			resolveId(id) {
				resolveIdCalls.push(id);
				return id in modules ? id : null;
			},
			load(id) {
				loadCalls.push(id);
				return modules[id];
			},
			transform(code) {
				transformCalls.push(code);
				return code;
			}
		});
	});

	it('caches calls to resolve, load, transform on repeat loads', () => {
		const plugins = [genPlugin({ x: `console.log( 42 );` })];
		let cache = {};
		return rollup
			.rollup({ input: 'x', plugins })
			.then(bundle => {
				cache = bundle.cache;
				return bundle.generate({ format: 'iife' });
			})
			.then(({ code }) => {
				return rollup.rollup({ input: 'x', plugins, cache });
			})
			.then(bundle => {
				return bundle.generate({ format: 'iife' });
			})
			.then(({ code }) => {
				assert.deepEqual(resolveIdCalls, ['x']);
				assert.deepEqual(loadCalls, ['x']);
				assert.deepEqual(transformCalls, ['console.log( 42 );']);
				assert.deepEqual(code, expectedCode);
			});
	});

	it('will not call resolve if given correctly primed cache', () => {
		const plugins = [genPlugin({ x: `console.log( 42 );` })];
		return rollup
			.rollup({
				input: 'x',
				plugins,
				cache: {
					hooks: { 'resolve|test-plugin|v1|x': 'x' }
				}
			})
			.then(bundle => {
				return bundle.generate({ format: 'iife' });
			})
			.then(({ code }) => {
				assert.deepEqual(resolveIdCalls, []);
				assert.deepEqual(loadCalls, ['x']);
				assert.deepEqual(transformCalls, ['console.log( 42 );']);
				assert.deepEqual(code, expectedCode);
			});
	});

	it('will not call load if given correctly primed cache', () => {
		const plugins = [genPlugin({ x: '' })];
		return rollup
			.rollup({
				input: 'x',
				plugins,
				cache: {
					hooks: { 'load|test-plugin|v1|x|0|0': 'console.log( 42 );' }
				}
			})
			.then(bundle => {
				return bundle.generate({ format: 'iife' });
			})
			.then(({ code }) => {
				assert.deepEqual(resolveIdCalls, ['x']);
				assert.deepEqual(loadCalls, []);
				assert.deepEqual(code, expectedCode);
			});
	});

	it('will not call transform if given correctly primed cache', () => {
		const plugins = [genPlugin({ x: `console.log( 42 );` })];
		return rollup
			.rollup({
				input: 'x',
				plugins,
				cache: {
					hooks: { 'transform|test-plugin|v1|x|console.log( 42 );': 'console.log( 42 )' }
				}
			})
			.then(bundle => {
				return bundle.generate({ format: 'iife' });
			})
			.then(({ code }) => {
				assert.deepEqual(resolveIdCalls, ['x']);
				assert.deepEqual(loadCalls, ['x']);
				assert.deepEqual(transformCalls, []);
				assert.deepEqual(code, expectedCode);
			});
	});
});
