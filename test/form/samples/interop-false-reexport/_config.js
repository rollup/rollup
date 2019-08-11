module.exports = {
	description: 'reexports with interop: false',
	options: {
		external: ['external'],
		output: { name: 'foo', interop: false }
	}
};
