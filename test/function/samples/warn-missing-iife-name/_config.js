module.exports = {
	description: 'warns if no name is provided for an IIFE bundle',
	options: { output: { format: 'iife' } },
	warnings: [
		{
			message:
				'If you do not supply "output.name", you may not be able to access the exports of an IIFE bundle.'
		}
	]
};
