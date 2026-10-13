const { loader } = require('../../../testHelpers.js');

module.exports = defineTest({
	description:
		'derives file name placeholders from the same rules as node:path for dotfiles, trailing dots and trailing slashes',
	options: {
		input: '/a/b/',
		plugins: [
			loader({
				'/a/b/': `console.log('entry');`
			}),
			{
				name: 'test-plugin',
				generateBundle() {
					this.emitFile({ type: 'asset', name: '.htaccess', source: 'dotfile' });
					this.emitFile({ type: 'asset', name: 'file.', source: 'trailing dot' });
					this.emitFile({ type: 'asset', name: 'style.css', source: 'regular file' });
				}
			}
		],
		output: {
			assetFileNames: 'assets/[name]-[ext][extname]-asset'
		}
	}
});
