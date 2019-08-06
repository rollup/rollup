module.exports = {
	description: 'avoid return or set module.exports to dot-asterisk style',
	options: {
		external: function () { return true; },
		output: {
			format: 'cjs'
		}
	}
};
