const path = require('node:path');
let noImporterReferenceId;
let mainReferenceId;
let nestedReferenceId;

module.exports = defineTest({
	description: 'allows specifying an importer when resolving ids',
	options: {
		input: 'main',
		plugins: {
			buildStart() {
				noImporterReferenceId = this.emitFile({ type: 'chunk', id: './lib.js' });
				mainReferenceId = this.emitFile({
					type: 'chunk',
					id: './lib.js',
					importer: path.resolve(__dirname, 'main.js')
				});
				nestedReferenceId = this.emitFile({
					type: 'chunk',
					id: './lib.js',
					importer: path.resolve(__dirname, 'nested/virtual.js')
				});
			},
			transform(code, id) {
				if (id.endsWith('main.js')) {
					return (
						`console.log('no importer', import.meta.ROLLUP_FILE_URL_${noImporterReferenceId});\n` +
						`console.log('from maim', import.meta.ROLLUP_FILE_URL_${mainReferenceId});\n` +
						`console.log('from nested', import.meta.ROLLUP_FILE_URL_${nestedReferenceId});\n`
					);
				}
			}
		}
	}
});
