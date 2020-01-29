const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'correctly returns string or null for the context resolveId helper',
	context: {
		require(id) {
			switch (id) {
				case 'external-name':
					return { value: 'external name' };
				case 'external-object':
					return { value: 'external object' };
				case 'resolveto-unresolved':
					return { value: 'unresolved' };
				default:
					throw new Error(`Unexpected import ${id}`);
			}
		}
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "this.resolveId" plugin context function used by plugin at position 1 is deprecated. The "this.resolve" plugin context function should be used instead.',
			plugin: 'at position 1'
		},
		{
			code: 'UNRESOLVED_IMPORT',
			importer: 'main.js',
			message:
				"'resolveto-unresolved' is imported by main.js, but could not be resolved – treating it as an external dependency",
			source: 'resolveto-unresolved',
			url: 'https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency'
		}
	],
	options: {
		strictDeprecations: false,
		plugins: [
			{
				resolveId(id, importer) {
					if (id.startsWith('resolveto-')) {
						const resolutionId = id.slice('resolveto-'.length);
						return this.resolveId(resolutionId, importer).then(resolvedId => {
							if (!resolvedId) {
								assert.strictEqual(resolutionId, 'unresolved');
								assert.strictEqual(resolvedId, null);
							} else {
								if (typeof resolvedId !== 'string') {
									throw new Error(
										`Only valid resolveId return types are string and null, found ${typeof resolvedId} ${JSON.stringify(
											resolvedId
										)}`
									);
								}
								return {
									id: resolvedId,
									external: resolvedId.startsWith('external')
								};
							}
						});
					}
				}
			},
			{
				resolveId(id) {
					switch (id) {
						case 'object':
							return {
								id: path.resolve(__dirname, 'existing-object.js'),
								external: false
							};
						case 'external-object':
							return {
								id: 'external-object',
								external: true
							};
						case 'name':
							return path.resolve(__dirname, 'existing-name.js');
						case 'external-name':
							return false;
					}
				}
			}
		]
	}
};
