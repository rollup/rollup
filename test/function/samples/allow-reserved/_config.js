module.exports = defineTest({
	description: 'allow reserved identifiers via custom acorn options',
	options: {
		acorn: {
			allowReserved: true
		}
	}
});
