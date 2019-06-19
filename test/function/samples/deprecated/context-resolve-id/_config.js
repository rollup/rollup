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
	warnings(warnings) {
		assert.strictEqual(warnings.length, 1);
		assert.strictEqual(warnings[0].code, 'UNRESOLVED_IMPORT');
	},
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
