module.exports = defineTest({
	description: 'Uses --context to set `this` value',
	command: 'rollup main.js --format commonjs --context window'
});
