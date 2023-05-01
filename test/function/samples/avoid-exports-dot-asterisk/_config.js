module.exports = defineTest({
	description: 'avoid return or set module.exports to dot-asterisk style',
	options: {
		external: () => true,
		output: {
			format: 'cjs'
		}
	}
});
