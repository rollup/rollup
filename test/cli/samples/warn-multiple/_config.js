const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'aggregates warnings of different types',
	command: 'rollup -c',
	stderr: stderr =>
		assertStderrIncludes(
			stderr,
			'(!) Mixing named and default exports\n' +
				"Consumers of your bundle will have to use bundle['default'] to access the default export, which may not be what you want. Use `output.exports: 'named'` to disable this warning\n" +
				'(!) Missing shims for Node.js built-ins\n' +
				"Creating a browser bundle that depends on 'url' and 'assert'. You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins\n" +
				'(!) Missing global variable names\n' +
				'Use output.globals to specify browser global variable names corresponding to external modules\n' +
				"url (guessing 'url')\n" +
				"assert (guessing 'assert')\n" +
				'(!) Import of non-existent export\n' +
				'main.js\n' +
				"4: import assert from 'assert';\n" +
				"5: import 'external';\n" +
				"6: import {doesNotExist} from './dep.js';\n" +
				'           ^\n' +
				'7: \n' +
				'8: console.log(this);\n' +
				'(!) `this` has been rewritten to `undefined`\n' +
				'https://rollupjs.org/guide/en/#error-this-is-undefined\n' +
				'main.js\n' +
				" 6: import {doesNotExist} from './dep.js';\n" +
				' 7: \n' +
				' 8: console.log(this);\n' +
				'                ^\n' +
				' 9: \n' +
				'10: export {url, assert as default};\n' +
				'(!) Plugin at position 1: Plugin warning.\n' +
				"(!) Module level directives cause errors when bundled, 'use stuff' was ignored.\n" +
				'main.js: (1:0)\n' +
				"1: 'use stuff';\n" +
				'   ^\n' +
				'2: \n' +
				"3: import url from 'url';"
		)
};
