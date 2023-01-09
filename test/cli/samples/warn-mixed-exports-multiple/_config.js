const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'warns when mixed exports are used',
	command: 'rollup -c',
	stderr: stderr => {
		assertIncludes(
			stderr,
			'(!) Mixing named and default exports\n' +
				'https://rollupjs.org/999-big-list-of-options.html#output-exports\n' +
				'The following entry modules are using named and default exports together:\n' +
				'lib1.js\n' +
				'lib2.js\n' +
				'lib3.js\n' +
				'...and 3 other entry modules\n' +
				'\n' +
				'Consumers of your bundle will have to use chunk.default to access their default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.\n'
		);
	}
};
