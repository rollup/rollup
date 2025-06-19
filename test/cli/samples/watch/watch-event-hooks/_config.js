const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'event hook shell commands write to stderr',
	retry: true,
	spawnScript: 'wrapper.js',
	spawnArgs: [
		'-cw',
		'--watch.onStart',
		'echo start',
		'--watch.onBundleStart',
		'echo bundleStart',
		'--watch.onBundleEnd',
		'echo bundleEnd',
		'--watch.onEnd',
		'echo end'
	],
	abortOnStderr(data) {
		process.stderr.write(data);
		if (data.includes('waiting for changes')) {
			return true;
		}
	},
	stderr(stderr) {
		// assert each hook individually
		assertIncludes(
			stderr,
			`watch.onStart $ echo start
start`
		);
		assertIncludes(
			stderr,
			`watch.onBundleStart $ echo bundleStart
bundleStart`
		);
		assertIncludes(
			stderr,
			`watch.onBundleEnd $ echo bundleEnd
bundleEnd`
		);
		assertIncludes(
			stderr,
			`watch.onEnd $ echo end
end`
		);
	}
});
