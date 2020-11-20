module.exports = {
	description: 'allows to use amd.autoId with amd.basePath',
	options: {
		input: ['main'],
		output: {
			amd: {
				autoId: true,
				basePath: 'some/where'
			}
		}
	},
	nestedDir: 'some/where',
	runAmd: {
		exports(exports) {
			return exports.getA();
		}
	}
};
