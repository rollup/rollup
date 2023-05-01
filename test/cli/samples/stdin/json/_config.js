module.exports = defineTest({
	description: 'pipe JSON over stdin to create a module',
	skipIfWindows: true,
	command: `echo '{"foo": 42, "bar": "ok"}' | rollup --stdin=json -p json`
});
