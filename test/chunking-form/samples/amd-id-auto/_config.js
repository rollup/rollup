module.exports = defineTest({
	description: 'allows to use amd.autoId',
	options: {
		input: ['main'],
		output: {
			amd: {
				autoId: true
			}
		}
	},
	runAmd: {
		exports(exports) {
			return exports.getA();
		}
	}
});
