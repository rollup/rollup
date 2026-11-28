module.exports = defineTest({
	description: 'passes import attributes to the external option before and after resolution',
	options: {
		external(id, _importer, isResolved, { attributes }) {
			return attributes.type === 'css' && (isResolved || id === 'direct.css');
		},
		output: { importAttributesKey: 'with' },
		plugins: [
			{
				name: 'resolve-imports',
				resolveId(id) {
					if (id === 'static-alias') return 'static.css';
				},
				resolveDynamicImport(id) {
					if (id === 'dynamic-alias') return { id: 'dynamic.css', attributes: { type: 'css' } };
				}
			}
		]
	}
});
