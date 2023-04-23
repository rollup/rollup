module.exports = defineTest({
	description: 'does not deconflict due to global variables used in other chunks',
	options: {
		input: ['main1.js', 'main2.js']
	}
});
