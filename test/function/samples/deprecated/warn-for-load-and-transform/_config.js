module.exports = defineTest({
	description:
		'get a warning when using strictDeprecations and returning attributes from the load or transform hooks',
	options: {
		strictDeprecations: true,
		plugins: [
			{
				resolveId(source) {
					if (source.endsWith('.json')) {
						return {
							id: source
						};
					}
				},
				load(id) {
					if (id.endsWith('.json')) {
						return {
							code: 'export default {a:1}',
							attributes: {}
						};
					}
				},
				transform(code, id) {
					if (id.endsWith('.json')) {
						return { code, attributes: {} };
					}
				}
			}
		]
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message: 'Returning attributes from the "load" hook is forbidden.',
			url: 'https://rollupjs.org/plugin-development/#load'
		},
		{
			code: 'DEPRECATED_FEATURE',
			message: 'Returning attributes from the "transform" hook is forbidden.',
			url: 'https://rollupjs.org/plugin-development/#transform'
		}
	]
});
