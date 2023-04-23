module.exports = defineTest({
	description: 'closes the watcher when stdin closes',
	retry: true,
	command: 'node wrapper.js main.js --watch --format es --file _actual/out.js'
});
