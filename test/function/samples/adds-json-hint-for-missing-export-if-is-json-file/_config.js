const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_ARRAY_JSON = path.join(__dirname, 'array.json');

module.exports = defineTest({
	description: 'should provide json hint when importing a no export json file',
	error: {
		binding: 'default',
		code: 'MISSING_EXPORT',
		exporter: ID_ARRAY_JSON,
		id: ID_MAIN,
		url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
		pos: 7,
		loc: {
			column: 7,
			file: ID_MAIN,
			line: 1
		},
		frame: `
1: import theArray from './array.json';
          ^
2: export default theArray;
		`,
		watchFiles: [ID_ARRAY_JSON, ID_MAIN],
		message:
			'main.js (1:7): "default" is not exported by "array.json", imported by "main.js". (Note that you need @rollup/plugin-json to import JSON files)'
	}
});
