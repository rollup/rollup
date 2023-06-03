export default {
	input: 'main.js',
	logLevel: 'debug',
	plugins: [
		{
			name: 'test',
			buildStart() {
				this.info('simple-info');
				this.info({ message: 'complex-info', url: 'https://my-url.net' });
				this.debug('simple-debug');
				this.debug({ message: 'complex-debug', url: 'https://my-url.net' });
			},
			transform() {
				this.info({ message: 'transform-info', url: 'https://my-url.net' }, 12);
				this.debug({ message: 'transform-debug', url: 'https://my-url.net' }, 13);
			}
		}
	],
	output: {
		format: 'es'
	}
};
