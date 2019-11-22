const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'aggregates warnings of different types',
	command: 'rollup -c',
	stderr: stderr => {
		assertStderrIncludes(
			stderr,
			'(!) Missing shims for Node.js built-ins\n' +
				"Creating a browser bundle that depends on 'url', 'assert' and 'path'. You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins\n"
		);
		assertStderrIncludes(
			stderr,
			'(!) Import of non-existent exports\n' +
				'main.js\n' +
				"4: import assert from 'assert';\n" +
				"5: import path from 'path';\n" +
				"6: import {doesNotExist, alsoNotFound} from './dep.js';\n" +
				'           ^\n' +
				'7: \n' +
				'8: export {url, assert, path};\n' +
				'...and 1 other occurrence\n'
		);
		assertStderrIncludes(
			stderr,

			"(!) Module level directives cause errors when bundled, 'use stuff' was ignored.\n" +
				'main.js: (1:0)\n' +
				"1: 'use stuff';\n" +
				'   ^\n' +
				'2: \n' +
				"3: import url from 'url';\n"
		);
	}
};
