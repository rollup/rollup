const text = "External modules couldn't be passed to the manualChunks.";

module.exports = defineTest({
	description: text,
	options: {
		external: id => {
			if (id.endsWith('external.js')) {
				return true;
			}
		},
		output: {
			manualChunks(id) {
				if (id.endsWith('external.js')) {
					throw new Error(text);
				}
			}
		}
	}
});
