module.exports = defineTest({
	description:
		'does not let ".." climb above a drive root when rendering the import path of an external remapped via output.paths',
	options: {
		makeAbsoluteExternalsRelative: true,
		plugins: [
			{
				name: 'test-plugin',
				resolveId(source) {
					if (source === 'ext') return { id: '/virtual/external.js', external: true };
				}
			}
		],
		output: {
			paths: { '/virtual/external.js': 'C:/../ext-a.js' }
		}
	}
});
