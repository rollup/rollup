const assert = require('node:assert');

module.exports = defineTest({
	description: 'filters logs via CLI',
	spawnArgs: [
		'--config',
		'--filterLogs="pluginCode:FIRST,pluginCode:SECOND"',
		'--filterLogs=pluginCode:THIRD',
		'--filterLogs=details.kind:visible'
	],
	env: {
		FORCE_COLOR: undefined,
		NO_COLOR: true,
		ROLLUP_FILTER_LOGS: 'pluginCode:FOURTH,pluginCode:FIFTH'
	},
	stderr(stderr) {
		assert.strictEqual(
			stderr,
			`
main.js → stdout...
[plugin test] first
[plugin test] second
[plugin test] third
[plugin test] fourth
[plugin test] fifth
[plugin test] nested
`
		);
	}
});
