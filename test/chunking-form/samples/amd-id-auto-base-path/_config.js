module.exports = defineTest({
	description: 'allows to use amd.autoId with amd.basePath, and chunks folder',
	options: {
		input: ['main'],
		output: {
			chunkFileNames: 'chunks/generated-[name].js',
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
});
