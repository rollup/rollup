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

	for (const sourcemap of [true, 'hidden']) {
		it(`preserves separate maps when normalized sourcemaps collide (${sourcemap})`, async () => {
			const warnings = [];
			const bundle = await rollup.rollup({
				input: ['x', 'y', 'z'],
				onwarn: warning => warnings.push(warning),
				plugins: [
					loader({
						x: `import 'main';`,
						y: `import 'main';`,
						z: `import 'main';`,
						main: `console.log('main');`
					})
				]
			});
			try {
				const { output } = await bundle.generate({
					format: 'es',
					entryFileNames: '[hash].js',
					sourcemap,
					sourcemapFileNames: '[hash].map'
				});
				const chunks = output.filter(file => file.type === 'chunk');
				const maps = output.filter(file => file.type === 'asset');
				assert.equal(chunks.length, 3);
				assert.equal(maps.length, chunks.length);
				assert.equal(new Set(chunks.map(chunk => chunk.sourcemapFileName)).size, chunks.length);
				for (const chunk of chunks) {
					const map = maps.find(map => map.fileName === chunk.sourcemapFileName);
					assert.equal(map.source, chunk.map.toString());
					assert.equal(JSON.parse(map.source).file, chunk.fileName);
					if (sourcemap === true) {
						assert.ok(chunk.code.endsWith(`//# sourceMappingURL=${map.fileName}\n`));
					}
				}
				assert.deepEqual(warnings, []);
			} finally {
				await bundle.close();
			}
		});
	}

	for (const [type, hook] of [
		['asset', 'renderChunk'],
		['asset', 'augmentChunkHash'],
		['prebuilt-chunk', 'augmentChunkHash']
	]) {
		it(`avoids sourcemap collisions with ${type} files emitted in ${hook}, ignoring case`, async () => {
			const warnings = [];
			const bundle = await rollup.rollup({
				input: 'main',
				onwarn: warning => warnings.push(warning),
				plugins: [loader({ main: `console.log(42);` })]
			});
			try {
				const options = {
					format: 'es',
					entryFileNames: '[hash].js',
					sourcemap: true,
					sourcemapFileNames: '[hash].map'
				};
				const { output: original } = await bundle.generate(options);
				const reservedFileName = original[0].sourcemapFileName.toUpperCase();
				const { output } = await bundle.generate({
					...options,
					plugins: [
						{
							[hook]() {
								this.emitFile(
									type === 'asset'
										? { type, fileName: reservedFileName, source: 'original asset' }
										: { type, fileName: reservedFileName, code: 'console.log("original chunk");' }
								);
							}
						}
					]
				});
				const chunk = output.find(file => file.type === 'chunk' && file.isEntry);
				const map = output.find(file => file.fileName === chunk.sourcemapFileName);
				const reservedFile = output.find(file => file.fileName === reservedFileName);
				assert.equal(output.length, 3);
				assert.notEqual(chunk.sourcemapFileName.toLowerCase(), reservedFileName.toLowerCase());
				assert.notEqual(chunk.fileName, original[0].fileName);
				assert.equal(map.source, chunk.map.toString());
				assert.equal(JSON.parse(map.source).file, chunk.fileName);
				assert.equal(
					reservedFile.source ?? reservedFile.code,
					type === 'asset' ? 'original asset' : 'console.log("original chunk");'
				);
				assert.deepEqual(warnings, []);
			} finally {
				await bundle.close();
			}
		});
	}

	it('preserves assets emitted by augmentChunkHash that collide with a chunk filename', async () => {
		const bundle = await rollup.rollup({
			input: 'main',
			plugins: [loader({ main: `console.log(42);` })]
		});
		try {
			const options = { format: 'es', entryFileNames: '[hash].js' };
			const { output: original } = await bundle.generate(options);
			const { output } = await bundle.generate({
				...options,
				plugins: [
					{
						augmentChunkHash() {
							this.emitFile({ type: 'asset', fileName: original[0].fileName, source: 'keep' });
						}
					}
				]
			});
			const chunk = output.find(file => file.type === 'chunk');
			const asset = output.find(file => file.type === 'asset');
			assert.equal(output.length, 2);
			assert.notEqual(chunk.fileName, original[0].fileName);
			assert.equal(chunk.code, original[0].code);
			assert.equal(asset.fileName, original[0].fileName);
			assert.equal(asset.source, 'keep');
		} finally {
			await bundle.close();
		}
	});

	it('resolves sourcemap collisions independently of renderChunk completion order', async () => {
		const bundle = await rollup.rollup({
			input: ['x', 'y', 'z'],
			plugins: [
				loader({
					x: `import 'main';`,
					y: `import 'main';`,
					z: `import 'main';`,
					main: `console.log('main');`
				})
			]
		});
		try {
			const outputs = [];
			for (const delayedChunk of ['x', 'z']) {
				const { output } = await bundle.generate({
					format: 'es',
					entryFileNames: '[hash].js',
					sourcemap: true,
					sourcemapFileNames: '[hash].map',
					plugins: [
						{
							async renderChunk(code, chunk) {
								if (chunk.name === delayedChunk) {
									await new Promise(resolve => setTimeout(resolve, 10));
								}
							}
						}
					]
				});
				outputs.push(
					output
						.map(({ fileName, code, source }) => ({ fileName, code, source }))
						.sort((left, right) => left.fileName.localeCompare(right.fileName))
				);
			}
			assert.deepEqual(outputs[0], outputs[1]);
		} finally {
			await bundle.close();
		}
	});

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

	it('derives the sourcemapFileName of inline sourcemaps from the sourcemap content', async () => {
		const options = { sourcemap: 'inline', sourcemapFileNames: '[name]-[hash].map' };
		const chunksWithSources = await generateChunks(options);
		const chunksWithoutSources = await generateChunks({
			...options,
			sourcemapExcludeSources: true
		});
		for (const { name, sourcemapFileName } of chunksWithSources) {
			assert.match(sourcemapFileName, new RegExp(`^${name}-[\\w-]{8}\\.map$`));
			assert.notEqual(
				sourcemapFileName,
				chunksWithoutSources.find(chunk => chunk.name === name).sourcemapFileName
			);
		}
	});

	it('assigns the same sourcemapFileName to identical inline sourcemaps', async () => {
		const collisionBundle = await rollup.rollup({
			input: ['x', 'y', 'z'],
			plugins: [
				loader({
					x: `import 'main';`,
					y: `import 'main';`,
					z: `import 'main';`,
					main: `console.log('main');`
				})
			]
		});
		try {
			const { output } = await collisionBundle.generate({
				format: 'es',
				entryFileNames: '[hash].js',
				sourcemap: 'inline',
				sourcemapFileNames: '[hash].map'
			});
			const chunks = output.filter(file => file.type === 'chunk');
			assert.equal(chunks.length, 3);
			const getSourcemapFileName = name =>
				chunks.find(chunk => chunk.name === name).sourcemapFileName;
			assert.equal(getSourcemapFileName('y'), getSourcemapFileName('z'));
			assert.notEqual(getSourcemapFileName('x'), getSourcemapFileName('y'));
			assert.equal(new Set(chunks.map(chunk => chunk.fileName)).size, 3);
		} finally {
			await collisionBundle.close();
		}
	});

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
