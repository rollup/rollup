module.exports = defineTest({
	description: 'CLI --plugin object',
	skipIfWindows: true,
	command: `echo 'console.log(42);' | rollup -f cjs -p '{transform: c => c + String.fromCharCode(10) + c}'`
});
