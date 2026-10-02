module.exports = defineTest({
	description:
		'does not run side effects of an unrelated entry when a dynamic entry is reached through a dynamic entry discovered later',
	options: {
		input: ['e1.js', 'main.js']
	},
	async exports(exports) {
		await exports.promise;
	}
});
