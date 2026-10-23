const { loader } = require('../../../testHelpers.js');

module.exports = defineTest({
	description:
		'resolves ".." segments in a relative output.paths value against the output directory when the importing chunk is nested',
	options: {
		makeAbsoluteExternalsRelative: true,
		plugins: [
			{
				name: 'test-plugin',
				resolveId(source) {
					if (source === 'main') return '/src/main.js';
					if (source === 'ext') return { id: '/virtual/external.js', external: true };
				}
			},
			loader({
				'/src/main.js': `import { a } from 'ext';\nconsole.log(a);`
			})
		],
		output: {
			entryFileNames: 'sub/[name].js',
			paths: { '/virtual/external.js': 'vendor/../../lib.js' }
		}
	}
});
