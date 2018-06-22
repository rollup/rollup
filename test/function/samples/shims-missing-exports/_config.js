module.exports = {
	description: 'shims missing exports',
	options: {
		shimMissingExports: true
	},
	warnings: [
		{
			code: 'SHIMMED_EXPORT',
			message: 'Export "missing" has been shimmed in module dep1.js.',
			exporter: "dep1.js",
			missing: 'missing'
		}
	]
};
