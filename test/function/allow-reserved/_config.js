module.exports = {
	solo: true,
	description: 'allow reserved identifiers via custom acorn options',
	options: {
		acorn: {
			allowReserved: true
		}
	}
};
