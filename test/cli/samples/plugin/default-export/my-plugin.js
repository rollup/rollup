exports.default = function(options) {
	if (options === void 0) options = {};
	return {
		transform(code) {
			// dumb search and replace for test purposes
			for (var key in options) {
				const rx = new RegExp(key, 'g');
				const value = JSON.stringify(options[key]);
				code = code.replace(rx, value);
			}
			return code;
		}
	};
};
