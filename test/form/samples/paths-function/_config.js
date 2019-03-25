module.exports = {
	description: 'external paths (#754)',
	options: {
		external: ['foo'],
		output: { paths: id => `https://unpkg.com/${id}` }
	}
};
