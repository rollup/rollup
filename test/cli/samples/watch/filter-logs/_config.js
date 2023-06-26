const { assertIncludes } = require('../../../../utils.js');

module.exports = defineTest({
	description: 'filters logs via CLI in watch mode',
	command:
		'rollup --config --watch --filterLogs="pluginCode:FIRST,pluginCode:SECOND" --filterLogs=pluginCode:THIRD',
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
first
second
third
fourth
fifth
created _actual.js`
		);
	}
});
