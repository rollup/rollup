export default {
	input: 'main.js',
	logLevel: 'debug',
	plugins: [
		{
			name: 'test',
			buildStart() {
				this.info({message: 'removed', pluginCode: 'REMOVED'});
				this.info({message: 'first', pluginCode: 'FIRST'});
				this.info({message: 'second', pluginCode: 'SECOND'});
				this.info({message: 'third', pluginCode: 'THIRD'});
				this.info({message: 'fourth', pluginCode: 'FOURTH'});
				this.info({message: 'fifth', pluginCode: 'FIFTH'});
				this.info({message: 'filtered', pluginCode: 'FILTERED'});
			},
		}
	],
	output: {
		format: 'es'
	}
};
