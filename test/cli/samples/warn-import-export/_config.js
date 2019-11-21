const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'warns about import and export related issues',
	command: 'rollup -c',
	stderr: stderr => {
		assertStderrIncludes(
			stderr,
			'(!) Mixing named and default exports\n' +
				"Consumers of your bundle will have to use bundle['default'] to access the default export, which may not be what you want. Use `output.exports: 'named'` to disable this warning\n"
		);
		assertStderrIncludes(
			stderr,

			'(!) Unused external imports\n' +
				"default imported from external module 'external' but never used\n"
		);
		assertStderrIncludes(
			stderr,

			'(!) Import of non-existent export\n' +
				'main.js\n' +
				"1: import unused from 'external';\n" +
				"2: import alsoUnused from './dep.js';\n" +
				'          ^\n' +
				'3: export const foo = 1;\n' +
				'4: export default 42;\n'
		);
	}
};
