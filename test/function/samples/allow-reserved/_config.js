module.exports = defineTest({
	// TODO Lukas remove acorn options
	skip: true,
	description: 'allow reserved identifiers via custom acorn options',
	options: {
		acorn: {
			allowReserved: true
		}
	}
});
