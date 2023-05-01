module.exports = defineTest({
	description:
		'do not remove calls to object expression methods that may have side-effects when properties may be shadowed',
	context: {
		unknownA: 'a',
		unknownB: 'b'
	}
});
