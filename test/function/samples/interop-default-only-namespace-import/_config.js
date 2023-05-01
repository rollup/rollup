module.exports = defineTest({
	description: 'allows importing a namespace when interop is "defaultOnly"',
	options: {
		external: 'external',
		output: {
			interop: 'defaultOnly'
		}
	}
});
