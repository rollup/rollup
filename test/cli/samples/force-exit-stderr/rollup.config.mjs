import process from 'node:process';

export default {
	input: 'main.js',
	output: { file: '_actual/bundle.js' },
	plugins: [
		{
			name: 'defer-warning-output',
			generateBundle() {
				process.stderr.cork();
				this.warn('Deferred CLI warning');
			},
			closeBundle() {
				setImmediate(() => process.stderr.uncork());
			}
		}
	]
};
