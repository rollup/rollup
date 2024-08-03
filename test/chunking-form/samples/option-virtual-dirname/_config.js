const commonjs = require('@rollup/plugin-commonjs');

module.exports = defineTest({
	description: 'expect the directory name for "virtual" files to be rollup_virtual',
	options: {
		plugins: [commonjs()],
		output: { preserveModules: true, virtualDirname: 'rollup_virtual' }
	}
});
