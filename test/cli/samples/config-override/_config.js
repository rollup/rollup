module.exports = defineTest({
	description: 'overrides config file with command line arguments',
	command: 'rollup -c -i main.js -f cjs',
	execute: true
});
