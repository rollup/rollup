module.exports = {
	description: 'external paths (#754)',
	options: {
		external: [ 'foo' ],
		paths: id => `https://unpkg.com/${id}`
	}
};
