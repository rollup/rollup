module.exports = defineTest({
	description: 'basic CLI --plugin functionality',
	command: `rollup main.js -f cjs --plugin @rollup/plugin-buble`
});
