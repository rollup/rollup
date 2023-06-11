module.exports = defineTest({
	description: 'warns for invalid options',
	options: {
		myInvalidInputOption: true,
		output: {
			myInvalidOutputOption: true
		}
	},
	warnings: [
		{
			code: 'UNKNOWN_OPTION',
			message:
				'Unknown input options: myInvalidInputOption. Allowed options: ' +
				// @ts-expect-error file outside root
				require('../../../misc/optionList').input
		},
		{
			code: 'UNKNOWN_OPTION',
			message:
				'Unknown output options: myInvalidOutputOption. Allowed options: ' +
				require('../../../misc/optionList').output
		}
	]
});
