const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'aggregates warnings of different types',
	command: 'rollup -c',
	stderr: stderr => {
		assertIncludes(
			stderr,
			'(!) Missing shims for Node.js built-ins\n' +
				'Creating a browser bundle that depends on "url", "assert" and "node:path". You might need to include https://github.com/FredKSchott/rollup-plugin-polyfill-node\n'
		);
		assertIncludes(
			stderr,
			'(!) Missing exports\n' +
				'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module\n' +
				'main.js\n' +
				'doesNotExist is not exported by dep.js\n' +
				"4: import assert from 'assert';\n" +
				"5: import path from 'node:path';\n" +
				"6: import {doesNotExist, alsoNotFound} from './dep.js';\n" +
				'           ^\n' +
				'7: \n' +
				'8: export {url, assert, path};\n' +
				'main.js\n' +
				'alsoNotFound is not exported by dep.js\n' +
				"4: import assert from 'assert';\n" +
				"5: import path from 'node:path';\n" +
				"6: import {doesNotExist, alsoNotFound} from './dep.js';\n" +
				'                         ^\n' +
				'7: \n' +
				'8: export {url, assert, path};'
		);
		assertIncludes(
			stderr,

			'(!) Module level directives cause errors when bundled, "use stuff" in "main.js" was ignored.\n' +
				'main.js (1:0)\n' +
				"1: 'use stuff';\n" +
				'   ^\n' +
				'2: \n' +
				"3: import url from 'url';\n"
		);
	}
});
