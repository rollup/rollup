// @ts-expect-error not included in types
const { loader } = require('../../../testHelpers.js');

const input = ['main', 'a', 'b', 'x'];
const modules = {
	a: "console.log('a');",
	b: "console.log('b');",
	main: "import 'b'; import 'x'; console.log('main');"
};

module.exports = defineTest({
	description: 'updates the importer hash when a dependency reorders its imports',
	options1: {
		input,
		plugins: [loader({ ...modules, x: "import 'a'; import 'b'; console.log('x');" })]
	},
	options2: {
		input,
		plugins: [loader({ ...modules, x: "import 'b'; import 'a'; console.log('x');" })]
	}
});
