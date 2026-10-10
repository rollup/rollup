const { loader } = require('../../../testHelpers.js');

module.exports = defineTest({
	description:
		'does not let ".." climb above a drive root when making absolute external paths relative',
	options: {
		input: 'C:/src/main.js',
		makeAbsoluteExternalsRelative: true,
		plugins: [
			{
				name: 'test-plugin',
				resolveId(source) {
					if (source === 'C:/src/main.js') return source;
					if (source === 'ext-a') return { id: 'C:/../ext-a.js', external: true };
					if (source === 'ext-b') return { id: 'C:/lib/../ext-b.js', external: true };
				}
			},
			loader({
				'C:/src/main.js': `import { a } from 'ext-a';\nimport { b } from 'ext-b';\nconsole.log(a, b);`
			})
		]
	}
});
