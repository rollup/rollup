module.exports = {
	description: 'external paths (#754)',
	options: {
		output: { paths: id => `https://unpkg.com/${id}` }
	}
};
