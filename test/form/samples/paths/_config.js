module.exports = {
	description: 'external paths (#754)',
	options: {
		external: ['foo'],
		output: { paths: { foo: 'https://unpkg.com/foo' } }
	}
};
