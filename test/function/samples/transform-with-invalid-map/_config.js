module.exports = defineTest({
	description: 'treats non-JSON transform maps as missing sourcemaps',
	options: {
		plugins: [
			{
				name: 'invalid map plugin a',
				transform(code) {
					return { code, map: 'undefined' };
				}
			},
			{
				name: 'invalid map plugin b',
				transform(code) {
					return { code, map: 'not-json' };
				}
			}
		],
		output: { sourcemap: true }
	},
	warnings: [
		{
			code: 'SOURCEMAP_BROKEN',
			message: `[plugin invalid map plugin a] Sourcemap is likely to be incorrect: a plugin (invalid map plugin a) was used to transform files, but didn't generate a sourcemap for the transformation. Consult the plugin documentation for help`,
			plugin: 'invalid map plugin a',
			url: 'https://rollupjs.org/troubleshooting/#warning-sourcemap-is-likely-to-be-incorrect'
		},
		{
			code: 'SOURCEMAP_BROKEN',
			message: `[plugin invalid map plugin b] Sourcemap is likely to be incorrect: a plugin (invalid map plugin b) was used to transform files, but didn't generate a sourcemap for the transformation. Consult the plugin documentation for help`,
			plugin: 'invalid map plugin b',
			url: 'https://rollupjs.org/troubleshooting/#warning-sourcemap-is-likely-to-be-incorrect'
		}
	]
});
