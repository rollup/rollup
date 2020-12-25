const path = require('path');

module.exports = {
	description: 'warns when creating an empty facade and "preserveEntrySignatures" is not specified',
	options: {
		input: ['main.js']
	},
	warnings: [
		{
			code: 'EMPTY_FACADE',
			id: path.join(__dirname, 'main.js'),
			message: `To preserve the export signature of the entry module "main.js", an empty facade chunk was created. This often happens when creating a bundle for a web app where chunks are placed in script tags and exports are ignored. In this case it is recommended to set "preserveEntrySignatures: false" to avoid this and reduce the number of chunks. Otherwise if this is intentional, set "preserveEntrySignatures: 'strict'" explicitly to silence this warning.`,
			url: 'https://rollupjs.org/guide/en/#preserveentrysignatures'
		}
	]
};
