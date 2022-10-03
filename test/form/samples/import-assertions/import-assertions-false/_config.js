module.exports = {
	description:
		'does not add import assertions for external JSON files when assertions are disabled',
	options: {
		external: ['./foo.json'],
		output: { name: 'bundle', externalImportAssertions: false }
	}
};
