module.exports = {
	description: 'supports disabling sanitization',
	options: {
		external: [':do-not-sanitize'],
		output: {
			sanitizeFileName: false
		}
	}
};
