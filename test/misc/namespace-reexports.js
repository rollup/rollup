const assert = require('node:assert/strict');
const { rollup } = require('../../dist/rollup');
const { loader } = require('../testHelpers.js');

describe('preserveNamespaceReexports', () => {
	const library = {
		helpers: "import { three } from 'constants'; export const nine = three * three;",
		constants: 'export const three = 3;',
		index:
			"import * as numbers from 'numbers'; export { numbers }; export * as alias from 'numbers'; export { nine } from 'helpers';",
		numbers:
			'export let count = 0; export function increment() { count++ } export function unused() { return 987654321 }'
	};

	function buildLibrary(modules = library, options = {}) {
		return rollup({ input: 'index', plugins: [loader(modules)], ...options });
	}

	async function buildConsumer(chunks, code) {
		const modules = Object.fromEntries(chunks.map(chunk => ['./' + chunk.fileName, chunk.code]));
		const bundle = await rollup({
			input: 'consumer',
			plugins: [loader({ ...modules, consumer: code })]
		});
		try {
			const {
				output: [chunk]
			} = await bundle.generate({ format: 'es' });
			return chunk.code;
		} finally {
			await bundle.close();
		}
	}

	it('keeps namespace aliases identical and lets consumers remove unused members', async () => {
		const bundle = await buildLibrary();
		try {
			const before = await bundle.generate({ format: 'es' });
			const { output } = await bundle.generate({ format: 'es', preserveNamespaceReexports: true });
			assert.equal(output.length, 2);
			assert.deepEqual(output.find(chunk => !chunk.isEntry).exports, [
				'count',
				'increment',
				'unused'
			]);
			assert.deepEqual(await bundle.generate({ format: 'es' }), before);
			const consumer = await buildConsumer(
				output,
				`
				import { numbers, alias, nine } from './index.js';
				numbers.increment();
				export default [alias.count, nine];
			`
			);
			assert.doesNotMatch(consumer, /987654321/);
			assert.deepEqual(
				(await import('data:text/javascript,' + encodeURIComponent(consumer))).default,
				[1, 9]
			);
			const identity = await buildConsumer(
				output,
				"import { numbers, alias } from './index.js'; export default numbers === alias;"
			);
			assert.equal(
				(await import('data:text/javascript,' + encodeURIComponent(identity))).default,
				true
			);
		} finally {
			await bundle.close();
		}
	});

	it('preserves nested namespaces across entry and barrel reexports', async () => {
		const bundle = await buildLibrary({
			index: "export { groups } from 'barrel';",
			barrel: "export * as groups from 'groups';",
			groups: "export * as numbers from 'numbers';",
			numbers: library.numbers
		});
		try {
			const { output } = await bundle.generate({ format: 'es', preserveNamespaceReexports: true });
			const code = await buildConsumer(
				output,
				"import { groups } from './index.js'; groups.numbers.increment(); export default groups.numbers.count;"
			);
			assert.doesNotMatch(code, /987654321/);
			assert.equal((await import('data:text/javascript,' + encodeURIComponent(code))).default, 1);
		} finally {
			await bundle.close();
		}
	});

	it('respects manual chunks, single-file builds and other output formats', async () => {
		const bundle = await buildLibrary();
		try {
			for (const options of [
				{ format: 'cjs' },
				{ format: 'es', inlineDynamicImports: true },
				{ format: 'es', manualChunks: { vendor: ['numbers'] } },
				{ format: 'es', preserveModules: true }
			]) {
				const regular = await bundle.generate(options);
				const preserved = await bundle.generate({ ...options, preserveNamespaceReexports: true });
				assert.deepEqual(preserved, regular);
			}
		} finally {
			await bundle.close();
		}
	});

	it('keeps reexport-only namespace chunks acyclic during chunk optimization', async () => {
		const bundle = await buildLibrary(
			{
				index: "export * as numbers from 'barrel';",
				barrel: "export * from 'numbers';",
				numbers: library.numbers
			},
			{
				onwarn(warning) {
					assert.fail(warning.message);
				}
			}
		);
		try {
			const { output } = await bundle.generate({ format: 'es', preserveNamespaceReexports: true });
			for (const chunk of output) assert.ok(!chunk.imports.includes(chunk.fileName));
			const code = await buildConsumer(
				output,
				"import {numbers} from './index.js'; numbers.increment(); export default numbers.count;"
			);
			assert.doesNotMatch(code, /987654321/);
			assert.equal((await import('data:text/javascript,' + encodeURIComponent(code))).default, 1);
		} finally {
			await bundle.close();
		}
	});

	it('preserves initialization order for direct and transitive reads and writes', async () => {
		for (const [source, helpers, expected] of [
			[
				"import { state } from 'state'; state.push('second'); export const snapshot = state.join(',');",
				{},
				'first,second'
			],
			[
				"export { snapshot } from 'helper';",
				{ helper: "import { state } from 'state'; export const snapshot = state.join(',');" },
				'first'
			],
			["import { value } from 'state'; export const snapshot = value;", {}, 1]
		]) {
			const bundle = await buildLibrary({
				index: "import 'first'; export * as observed from 'observed';",
				first: "import { state, increment } from 'state'; state.push('first'); increment();",
				state:
					'export const state = []; export let value = 0; export function increment() { value++ }',
				observed: source,
				...helpers
			});
			try {
				const regular = await bundle.generate({ format: 'es' });
				const preserved = await bundle.generate({ format: 'es', preserveNamespaceReexports: true });
				assert.deepEqual(preserved, regular);
				const code = await buildConsumer(
					preserved.output,
					"import {observed} from './index.js'; export default observed.snapshot;"
				);
				const result = (await import('data:text/javascript,' + encodeURIComponent(code))).default;
				assert.equal(result, expected);
			} finally {
				await bundle.close();
			}
		}
	});

	it('keeps the generated namespace for synthetic named exports', async () => {
		const modules = {
			index: "export * as values from 'source';",
			source: 'export default { answer: 42 };'
		};
		const bundle = await buildLibrary(modules, {
			plugins: [
				loader(modules),
				{
					name: 'synthetic-source',
					transform(code, id) {
						if (id === 'source') return { code, syntheticNamedExports: true };
					}
				}
			]
		});
		try {
			const regular = await bundle.generate({ format: 'es' });
			const preserved = await bundle.generate({ format: 'es', preserveNamespaceReexports: true });
			assert.deepEqual(preserved, regular);
			const code = await buildConsumer(
				preserved.output,
				"import {values} from './index.js'; export default values.answer;"
			);
			assert.equal((await import('data:text/javascript,' + encodeURIComponent(code))).default, 42);
		} finally {
			await bundle.close();
		}
	});

	it('keeps a module in a static cycle with its importer', async () => {
		const bundle = await buildLibrary(
			{
				index: "export * as numbers from 'numbers'; export const initial = 1;",
				numbers: "import { initial } from 'index'; export function read() { return initial; }"
			},
			{
				onwarn(warning, warn) {
					if (warning.code !== 'CIRCULAR_DEPENDENCY') warn(warning);
				}
			}
		);
		try {
			const regular = await bundle.generate({ format: 'es' });
			assert.deepEqual(
				await bundle.generate({ format: 'es', preserveNamespaceReexports: true }),
				regular
			);
		} finally {
			await bundle.close();
		}
	});
});
