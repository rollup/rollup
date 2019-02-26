const assert = require('assert');
const acorn = require('acorn');
const { executeBundle } = require('../utils.js');
const rollup = require('../../dist/rollup');

describe('incremental', () => {
	let resolveIdCalls;
	let transformCalls;
	let modules;

	const plugin = {
		resolveId: id => {
			resolveIdCalls += 1;
			return id === 'external' ? false : id;
		},

		load: id => {
			return modules[id];
		},

		transform: code => {
			transformCalls += 1;
			return code;
		}
	};

	beforeEach(() => {
		resolveIdCalls = 0;
		transformCalls = 0;

		modules = {
			entry: `import foo from 'foo'; export default foo;`,
			foo: `export default 42`,
			bar: `export default 21`
		};
	});

	it('does not resolves id and transforms in the second time', () => {
		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(bundle => {
				assert.equal(resolveIdCalls, 2);
				assert.equal(transformCalls, 2);
				return rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache: bundle
				});
			})
			.then(bundle => {
				assert.equal(resolveIdCalls, 3); // +1 for entry point which is resolved every time
				assert.equal(transformCalls, 2);

				return executeBundle(bundle);
			})
			.then(result => {
				assert.equal(result, 42);
			});
	});

	it('transforms modified sources', () => {
		let cache;

		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(bundle => {
				assert.equal(transformCalls, 2);

				return executeBundle(bundle).then(result => {
					assert.equal(result, 42);

					modules.foo = `export default 43`;
					cache = bundle.cache;
				});
			})
			.then(() => {
				return rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache
				});
			})
			.then(bundle => {
				assert.equal(transformCalls, 3);

				return executeBundle(bundle);
			})
			.then(result => {
				assert.equal(result, 43);
			});
	});

	it('resolves id of new imports', () => {
		let cache;

		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(bundle => {
				assert.equal(resolveIdCalls, 2);

				return executeBundle(bundle).then(result => {
					assert.equal(result, 42);

					modules.entry = `import bar from 'bar'; export default bar;`;
					cache = bundle.cache;
				});
			})
			.then(() => {
				return rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache
				});
			})
			.then(bundle => {
				assert.equal(resolveIdCalls, 4);

				return executeBundle(bundle);
			})
			.then(result => {
				assert.equal(result, 21);
			});
	});

	it('respects externals from resolveId', () => {
		let cache;
		modules.foo = `import p from 'external'; export default p;`;

		const require = id => id === 'external' && 43;

		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(bundle => {
				assert.equal(resolveIdCalls, 3);

				return executeBundle(bundle, require).then(result => {
					assert.equal(result, 43);
					cache = bundle.cache;
				});
			})
			.then(() => {
				return rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache
				});
			})
			.then(bundle => {
				assert.equal(resolveIdCalls, 4);

				return executeBundle(bundle, require);
			})
			.then(result => {
				assert.equal(result, 43);
			});
	});

	it('keeps ASTs between runs', () => {
		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(bundle => {
				const asts = {};
				bundle.cache.modules.forEach(module => {
					asts[module.id] = module.ast;
				});

				assert.deepEqual(asts.entry, acorn.parse(modules.entry, { sourceType: 'module' }));
				assert.deepEqual(asts.foo, acorn.parse(modules.foo, { sourceType: 'module' }));
			});
	});

	it('recovers from errors', () => {
		modules.entry = `import foo from 'foo'; import bar from 'bar'; export default foo + bar;`;

		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(cache => {
				modules.foo = `var 42 = nope;`;

				return rollup
					.rollup({
						input: 'entry',
						plugins: [plugin],
						cache
					})
					.catch(err => {
						return cache;
					});
			})
			.then(cache => {
				modules.foo = `export default 42;`;

				return rollup
					.rollup({
						input: 'entry',
						plugins: [plugin],
						cache
					})
					.then(bundle => {
						return executeBundle(bundle);
					})
					.then(result => {
						assert.equal(result, 63);
					});
			});
	});

	it('combines resolvedIds from resolvedExternalIds', () => {
		modules = {
			entry: `import foo from 'foo'; import external from 'external'; console.log(foo(external));`,
			foo: `export default 42`
		};

		return rollup
			.rollup({
				input: 'entry',
				external: ['external'],
				plugins: [plugin]
			})
			.then(bundle => {
				assert.equal(bundle.cache.modules[1].id, 'foo');
				assert.equal(bundle.cache.modules[0].id, 'entry');

				assert.deepEqual(bundle.cache.modules[0].resolvedIds, {
					foo: { id: 'foo', external: false },
					external: { id: 'external', external: true }
				});
			});
	});
});
