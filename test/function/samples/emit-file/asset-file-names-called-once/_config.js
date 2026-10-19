const assert = require('node:assert/strict');

const assetFileNamesCalls = [];

module.exports = defineTest({
	description:
		'only calls output.assetFileNames once per deduplicated asset with a deterministic representative emission',
	options: {
		strictDeprecations: false,
		output: {
			assetFileNames(info) {
				assetFileNamesCalls.push({
					names: [...info.names],
					name: info.name,
					originalFileName: info.originalFileName,
					source: info.source
				});
				return '[name][extname]';
			}
		},
		plugins: [
			{
				name: 'test',
				buildStart() {
					for (let index = 0; index < 3; index++) {
						this.emitFile({
							type: 'asset',
							name: 'same.txt',
							originalFileName: 'same-source.txt',
							source: 'same'
						});
					}
					this.emitFile({ type: 'asset', name: 'bb.txt', source: 'different' });
					this.emitFile({ type: 'asset', name: 'a.txt', source: 'different' });
					// the following groups are emitted on purpose in orders where the representative
					// is not the first emission
					this.emitFile({ type: 'asset', name: 'icon.svg', source: 'icon' });
					this.emitFile({
						type: 'asset',
						name: 'icon.svg',
						originalFileName: 'b/icon.svg',
						source: 'icon'
					});
					this.emitFile({
						type: 'asset',
						name: 'icon.svg',
						originalFileName: 'a/icon.svg',
						source: 'icon'
					});
					this.emitFile({ type: 'asset', source: 'raw-name' });
					this.emitFile({ type: 'asset', name: 'asset', source: 'raw-name' });
					this.emitFile({
						type: 'asset',
						name: 'bytes',
						source: new TextEncoder().encode('sa')
					});
					this.emitFile({ type: 'asset', name: 'bytes', source: 'sa' });
				},
				generateBundle(options, bundle) {
					this.emitFile({
						type: 'asset',
						name: 'same.txt',
						originalFileName: 'same-source.txt',
						source: 'same'
					});
					this.emitFile({ type: 'asset', name: 'c.txt', source: 'same' });
					assert.deepEqual(assetFileNamesCalls, [
						{
							names: ['same.txt'],
							name: 'same.txt',
							originalFileName: 'same-source.txt',
							source: 'same'
						},
						{
							names: ['a.txt', 'bb.txt'],
							name: 'a.txt',
							originalFileName: null,
							source: 'different'
						},
						{
							names: ['icon.svg'],
							name: 'icon.svg',
							originalFileName: 'a/icon.svg',
							source: 'icon'
						},
						{ names: ['asset'], name: 'asset', originalFileName: null, source: 'raw-name' },
						{ names: ['bytes'], name: 'bytes', originalFileName: null, source: 'sa' }
					]);
					const assets = Object.values(bundle).filter(value => value.type === 'asset');
					assert.deepEqual(
						assets.map(({ fileName, names, originalFileNames }) => ({
							fileName,
							names,
							originalFileNames
						})),
						[
							{
								fileName: 'same.txt',
								names: ['same.txt', 'c.txt'],
								originalFileNames: ['same-source.txt']
							},
							{
								fileName: 'a.txt',
								names: ['a.txt', 'bb.txt'],
								originalFileNames: []
							},
							{
								fileName: 'icon.svg',
								names: ['icon.svg'],
								originalFileNames: ['a/icon.svg', 'b/icon.svg']
							},
							{
								fileName: 'asset',
								names: ['asset'],
								originalFileNames: []
							},
							{
								fileName: 'bytes',
								names: ['bytes'],
								originalFileNames: []
							}
						]
					);
				}
			}
		]
	}
});
