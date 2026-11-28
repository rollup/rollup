module.exports = defineTest({
	description: 'keeps namespace member accesses of external star reexports dynamic',
	options: {
		external: ['external']
	}
});
