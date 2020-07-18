const path = require('path');

module.exports = {
	description: 'warns when using implicit default export mode in CommonJS',
	options: { output: { exports: undefined } },
	warnings: [
		{
			code: 'PREFER_NAMED_EXPORTS',
			id: path.join(__dirname, 'main.js'),
			message:
				'Entry module "main.js" is implicitly using "default" export mode, which means for CommonJS output that its default export is assigned to "module.exports". For many tools, such CommonJS output will not be interchangeable with the original ES module. If this is intended, explicitly set "output.exports" to either "auto" or "default", otherwise you might want to consider changing the signature of "main.js" to use named exports only.',
			url: 'https://rollupjs.org/guide/en/#outputexports'
		}
	]
};
