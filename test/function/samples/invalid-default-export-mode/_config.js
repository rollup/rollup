module.exports = {
	description: 'throw for invalid default export mode',
	options: {
		output: {
			exports: 'default'
		}
	},
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		message:
			'"default" was specified for "output.exports", but entry module "main.js" has the following exports: "default" and "foo"',
		url: 'https://rollupjs.org/guide/en/#outputexports'
	}
};
