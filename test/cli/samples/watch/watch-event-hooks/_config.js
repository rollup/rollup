const { assertIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'onStart event hoot shell command executes correctly',
	command:
		'rollup -cw --watch --watch.onStart "echo start" --watch.onBundleStart "echo bundleStart" --watch.onBundleEnd "echo bundleEnd" --watch.onEnd "echo onEnd" --watch.onError "echo onError"',
	stderr(stderr) {
		assertIncludes(
			stderr,
			`watch.onStart $ echo start
start
bundles main.js → _actual...
watch.onBundleStart $ echo bundleStart
bundleStart
created _actual in 16ms
watch.onBundleEnd $ echo bundleEnd
bundleEnd
watch.onEnd $ echo onEnd
onEnd
`
		);
		// assert.strictEqual(stderr.slice(0, 12), `${CLEAR_SCREEN}${UNDERLINE}rollup`);
	}
};
