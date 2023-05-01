module.exports = defineTest({
	description: 'stdin input of code that imports a copy of itself',
	skipIfWindows: true,
	command: `cat input.txt | rollup -f cjs --silent`
});
