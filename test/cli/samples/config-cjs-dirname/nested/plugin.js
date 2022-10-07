const path = require('node:path');

module.exports = () => ({
	transform(code) {
		return `console.log('${path
			.relative(process.cwd(), __filename)
			.replace('\\', '/')}');\n${code}`;
	}
});
