module.exports = defineTest({
	description:
		'allowInputInsideOutputPath set to true, should not throw an error when input is inside output path',
	spawnArgs: ['-cw'],
	abortOnStderr(data) {
		return data.includes('waiting for changes');
	},
	execute: true
});
