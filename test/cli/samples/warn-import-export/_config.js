const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'warns about import and export related issues',
	command: 'rollup -c',
	stderr: stderr => {
		assertIncludes(
			stderr,
			'(!) Mixing named and default exports\n' +
				'https://rollupjs.org/configuration-options/#output-exports\n' +
				'The following entry modules are using named and default exports together:\n' +
				'main.js\n' +
				'\n' +
				'Consumers of your bundle will have to use chunk.default to access their default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.\n'
		);
		assertIncludes(
			stderr,
			'(!) Unused external imports\n' +
				`default imported from external module "external" but never used in "main.js".\n`
		);
		assertIncludes(
			stderr,
			'(!) Missing exports\n' +
				'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module\n' +
				'main.js\n' +
				'missing is not exported by dep.js\n' +
				"4: import 'unresolvedExternal';\n" +
				'5: \n' +
				'6: export const missing = dep.missing;\n' +
				'                              ^\n' +
				'7: export default 42;\n' +
				'main.js\n' +
				'default is not exported by dep.js\n' +
				"1: import unused from 'external';\n" +
				"2: import * as dep from './dep.js';\n" +
				"3: import alsoUnused from './dep.js';\n" +
				'          ^\n' +
				"4: import 'unresolvedExternal';\n"
		);
		assertIncludes(
			stderr,
			'(!) Conflicting re-exports\n' +
				'"main.js" re-exports "foo" from both "dep.js" and "dep2.js" (will be ignored).\n' +
				'"main.js" re-exports "bar" from both "dep.js" and "dep2.js" (will be ignored).\n'
		);
		assertIncludes(
			stderr,
			'(!) Unresolved dependencies\n' +
				'https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency\n' +
				'unresolvedExternal (imported by "main.js" and "dep.js")\n' +
				'otherUnresolvedExternal (imported by "dep.js")\n'
		);
	}
});
