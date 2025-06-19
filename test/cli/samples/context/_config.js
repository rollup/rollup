module.exports = defineTest({
	description: 'Uses --context to set `this` value',
	spawnArgs: ['main.js', '--format', 'commonjs', '--context', 'window']
});
