module.exports = defineTest({
	// TODO SWC remove acorn options
	skip: true,
	description: 'allow reserved identifiers via custom acorn options',
	options: {
		acorn: {
			allowReserved: true
		}
	}
});
