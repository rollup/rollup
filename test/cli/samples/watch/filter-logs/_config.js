const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'filters logs via CLI in watch mode',
	spawnArgs: [
		'--config',
		'--watch',
		'--filterLogs=pluginCode:FIRST,pluginCode:SECOND',
		'--filterLogs=pluginCode:THIRD'
	],
	env: {
		FORCE_COLOR: undefined,
		NO_COLOR: true,
		ROLLUP_FILTER_LOGS: 'pluginCode:FOURTH,pluginCode:FIFTH'
	},
	abortOnStderr(data) {
		if (data.startsWith('created _actual.js')) {
			return true;
		}
	},
	stderr(stderr) {
		assertIncludes(
			stderr,
			`
bundles main.js → _actual.js...
[plugin test] first
[plugin test] second
[plugin test] third
[plugin test] fourth
[plugin test] fifth
created _actual.js`
		);
	}
});
