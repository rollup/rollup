module.exports = {
	description: 'throws when there is a conflict between two emitted named chunks',
	options: {
		input: 'main',
		plugins: {
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'buildStart1',
					fileName: 'custom/build-start-chunk.js'
				});
				this.emitFile({
					type: 'chunk',
					id: 'buildStart2',
					fileName: 'custom/build-start-chunk.js'
				});
			}
		}
	},
	generateError: {
		code: 'FILE_NAME_CONFLICT',
		message:
			'Could not emit file "custom/build-start-chunk.js" as it conflicts with an already emitted file.'
	}
};
