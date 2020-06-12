module.exports = {
	description: 'supports quote characters in external ids',
	options: {
		output: {
			name: 'Q',
			globals: {
				"quoted'external": 'quotedExternal'
			}
		},
		plugins: [
			{
				resolveId(id, parent) {
					if (!parent) return id;
					return { id: "quoted'external", external: true };
				}
			}
		]
	}
};
