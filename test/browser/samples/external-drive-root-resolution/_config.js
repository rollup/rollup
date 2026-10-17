const { loader } = require('../../../testHelpers.js');

module.exports = defineTest({
	description:
		'does not let ".." climb above a drive root when resolving relative external imports',
	options: {
		input: 'C:/src/main.js',
		external: source => source === '../../ext.js',
		makeAbsoluteExternalsRelative: true,
		plugins: [
			loader({
				'C:/src/main.js': `import { a } from '../../ext.js';\nconsole.log(a);`
			})
		]
	}
});
