module.exports = defineRollupTest({
	description: 'Uses --context to set `this` value',
	command: 'rollup main.js --format commonjs --context window'
});
