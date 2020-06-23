exports.mySuperPlugin2 = () => ({
	transform(code) {
		return `${code}console.log("plugin2");\n`;
	}
});
