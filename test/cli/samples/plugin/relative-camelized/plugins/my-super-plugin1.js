exports.mySuperPlugin1 = () => ({
	transform(code) {
		return `${code}console.log("plugin1");\n`;
	}
});
