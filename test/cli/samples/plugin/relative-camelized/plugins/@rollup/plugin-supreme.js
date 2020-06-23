exports.supreme = () => ({
	transform(code) {
		return `${code}console.log("plugin4");\n`;
	}
});
