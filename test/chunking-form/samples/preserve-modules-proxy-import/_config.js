module.exports = {
	description:
		'correctly resolves imports via a proxy module as direct imports when preserving modules',
	options: {
		external: 'external',
		output: { preserveModules: true }
	}
};
