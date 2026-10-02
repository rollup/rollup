const assert = require('node:assert');
const path = require('node:path');
const { SourceMapConsumer } = require('source-map');
const rollup = require('../../dist/rollup');
const { loader } = require('../testHelpers.js');

describe('in-memory sourcemaps', () => {
	it('generates an in-memory sourcemap', async () => {
		const bundle = await rollup.rollup({
			input: 'main',
			plugins: [loader({ main: `console.log( 42 );` })]
		});
		const {
			output: [generated]
		} = await bundle.generate({
			format: 'cjs',
			sourcemap: true,
			sourcemapFile: path.resolve('bundle.js')
		});
		const smc = await new SourceMapConsumer(generated.map);
		const locator = (await import('locate-character')).getLocator(generated.code, {
			offsetLine: 1
		});
		const loc = smc.originalPositionFor(locator('42')); // 42
		assert.equal(loc.source, 'main');
		assert.equal(loc.line, 1);
		assert.equal(loc.column, 13);
	});
});

describe('sourcemap chunk hashes', () => {
	let bundle;

	before(async () => {
		bundle = await rollup.rollup({
			input: 'main',
			plugins: [
				loader({
					main: `export const load = () => import('dynamic');`,
					dynamic: `export const value = 42;`
				})
			]
		});
	});

	after(() => bundle.close());

	async function generateChunks(options) {
		const { output } = await bundle.generate({
			format: 'es',
			entryFileNames: '[name]-[hash].js',
			chunkFileNames: '[name]-[hash].js',
			...options
		});
		return output.filter(file => file.type === 'chunk');
	}

	it('keeps chunk hashes when sourcemaps are hidden', async () => {
		const withoutMaps = await generateChunks({ sourcemap: false });
		const hiddenMaps = await generateChunks({ sourcemap: 'hidden' });
		assert.deepEqual(
			hiddenMaps.map(({ fileName, code }) => ({ fileName, code })),
			withoutMaps.map(({ fileName, code }) => ({ fileName, code }))
		);
	});

	for (const [description, options1, options2] of [
		['sourcemap comments are added', { sourcemap: false }, { sourcemap: true }],
		[
			'external sourcemap file names change',
			{ sourcemap: true, sourcemapFileNames: '[name]-first.map' },
			{ sourcemap: true, sourcemapFileNames: '[name]-second.map' }
		],
		[
			'external sourcemap base URLs change',
			{ sourcemap: true, sourcemapBaseUrl: 'https://example.com/first/' },
			{ sourcemap: true, sourcemapBaseUrl: 'https://example.com/second/' }
		],
		[
			'inline sourcemap contents change',
			{ sourcemap: 'inline' },
			{ sourcemap: 'inline', sourcemapExcludeSources: true }
		],
		[
			'referenced sourcemap hashes change',
			{ sourcemap: true, sourcemapFileNames: '[name]-[chunkhash]-[hash].map' },
			{
				sourcemap: true,
				sourcemapFileNames: '[name]-[chunkhash]-[hash].map',
				sourcemapExcludeSources: true
			}
		],
		[
			'referenced sourcemap hashes change with a base URL',
			{
				sourcemap: true,
				sourcemapBaseUrl: 'https://example.com/maps/',
				sourcemapFileNames: '[name]-[chunkhash]-[hash].map'
			},
			{
				sourcemap: true,
				sourcemapBaseUrl: 'https://example.com/maps/',
				sourcemapFileNames: '[name]-[chunkhash]-[hash].map',
				sourcemapExcludeSources: true
			}
		]
	]) {
		it(`updates chunk and importer hashes when ${description}`, async () => {
			const chunks1 = await generateChunks(options1);
			const chunks2 = await generateChunks(options2);
			assert.equal(chunks1.length, 2);
			assert.equal(chunks2.length, 2);
			for (let index = 0; index < chunks1.length; index++) {
				assert.equal(chunks1[index].name, chunks2[index].name);
				assert.notEqual(chunks1[index].code, chunks2[index].code);
				assert.notEqual(chunks1[index].fileName, chunks2[index].fileName);
				assert.equal(chunks2[index].map.file, chunks2[index].fileName);
				assert.ok(!chunks2[index].code.includes('!~{'));
			}
			assert.ok(chunks2[0].code.includes(chunks2[1].fileName));
		});
	}

	for (const options of [
		{ sourcemap: 'inline' },
		{ sourcemap: true, sourcemapBaseUrl: 'https://example.com/maps/' },
		{ sourcemap: true, sourcemapFileNames: '[name]-[chunkhash]-[hash].map' }
	]) {
		it(`keeps hashes stable when adding an unrelated entry with ${JSON.stringify(options)}`, async () => {
			const originalChunks = await generateChunks(options);
			const extendedBundle = await rollup.rollup({
				input: ['other', 'main'],
				plugins: [
					loader({
						main: `export const load = () => import('dynamic');`,
						dynamic: `export const value = 42;`,
						other: `console.log('unrelated');`
					})
				]
			});
			try {
				const { output } = await extendedBundle.generate({
					format: 'es',
					entryFileNames: '[name]-[hash].js',
					chunkFileNames: '[name]-[hash].js',
					...options
				});
				for (const original of originalChunks) {
					const extended = output.find(chunk => chunk.name === original.name);
					assert.equal(extended.fileName, original.fileName);
					assert.equal(extended.code, original.code);
				}
			} finally {
				await extendedBundle.close();
			}
		});
	}
});
