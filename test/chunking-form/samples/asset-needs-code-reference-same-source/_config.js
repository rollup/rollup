const assert = require('node:assert');

module.exports = defineTest({
	description:
		'emits unreferenced assets if needsCodeReference is true if they are also emitted without that flag',
	options: {
		output: {
			assetFileNames: '[name][extname]'
		},
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.emitFile({
						type: 'asset',
						name: 'needs-reference1.txt',
						needsCodeReference: true,
						source: 'source1'
					});
					this.emitFile({
						type: 'asset',
						name: 'file1.txt',
						source: 'source1'
					});
					this.emitFile({
						type: 'asset',
						name: 'file2.txt',
						source: 'source2'
					});
					this.emitFile({
						type: 'asset',
						name: 'needs-reference2.txt',
						needsCodeReference: true,
						source: 'source2'
					});
					this.emitFile({
						type: 'asset',
						name: 'needs-reference3.txt',
						needsCodeReference: true,
						source: 'source3'
					});
					this.emitFile({
						type: 'asset',
						name: 'file4.txt',
						source: 'source4'
					});
					this.emitFile({
						type: 'asset',
						name: 'needs-reference5.txt',
						needsCodeReference: true,
						source: 'source5'
					});
					this.emitFile({
						type: 'asset',
						name: 'file6.txt',
						source: 'source6'
					});
				},
				renderStart() {
					this.emitFile({
						type: 'asset',
						name: 'file3.txt',
						source: 'source3'
					});
					this.emitFile({
						type: 'asset',
						name: 'needs-reference4.txt',
						needsCodeReference: true,
						source: 'source4'
					});
				},
				generateBundle(_, bundle) {
					this.emitFile({
						type: 'asset',
						name: 'file5.txt',
						source: 'source5'
					});
					this.emitFile({
						type: 'asset',
						name: 'needs-reference6.txt',
						needsCodeReference: true,
						source: 'source6'
					});

					assert.deepEqual(Object.keys(bundle).sort(), [
						'file1.txt',
						'file2.txt',
						'file4.txt',
						'file6.txt',
						'main.js',
						'needs-reference3.txt',
						'needs-reference5.txt'
					]);
				}
			}
		]
	}
});
