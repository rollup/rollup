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
				"2: import * as dep from './dep.js';\n" +
				"3: import alsoUnused from './dep.js';\n" +
				'          ^\n' +
				"4: import 'unresolvedExternal';\n"
		);
		assertStderrIncludes(
			stderr,
			'(!) Missing exports\n' +
				'https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module\n' +
				'main.js\n' +
				'missing is not exported by dep.js\n' +
				"4: import 'unresolvedExternal';\n" +
				'5: \n' +
				'6: export const missing = dep.missing;\n' +
				'                              ^\n' +
				'7: export default 42;\n'
		);
		assertStderrIncludes(
			stderr,
			'(!) Conflicting re-exports\n' +
				"main.js re-exports 'foo' from both dep.js and dep2.js (will be ignored)\n" +
				"main.js re-exports 'bar' from both dep.js and dep2.js (will be ignored)\n"
		);
		assertStderrIncludes(
			stderr,
			'(!) Unresolved dependencies\n' +
				'https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency\n' +
				'unresolvedExternal (imported by main.js, dep.js)\n' +
				'otherUnresolvedExternal (imported by dep.js)\n'
		);
	}
};
