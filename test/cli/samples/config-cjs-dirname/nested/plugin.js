const path = require('path');

module.exports = () => ({
	transform(code) {
		return `console.log('${path
			.relative(process.cwd(), __filename)
			.replace('\\', '/')}');\n${code}`;
	}
});
