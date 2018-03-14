const rollup = require('../dist/rollup.js');
const loadConfig = require('./load-perf-config').loadPerfConfig;

loadConfig().then(async config =>
	(await rollup.rollup(config)).generate(
		Array.isArray(config.output) ? config.output[0] : config.output
	)
);
