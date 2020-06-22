exports.mySuperPlugin = () => ({
	transform() {
		return "console.log('transformed')";
	}
});
