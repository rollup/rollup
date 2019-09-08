const path = require('path');

module.exports = {
	description:
		'fails with a helpful error if creating a namespace object containing a reexported external namespace',
	options: {
		external: ['external']
	},
	error: {
		code: 'NAMESPACE_CANNOT_CONTAIN_EXTERNAL',
		message:
			'Cannot create an explicit namespace object for module "reexport" because it contains a reexported external namespace',
		id: path.join(__dirname, 'reexport.js'),
		watchFiles: [path.join(__dirname, 'main.js'), path.join(__dirname, 'reexport.js')]
	}
};
