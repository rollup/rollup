module.exports = {
	description: 'supports disabling sanitization',
	options: {
		external: [':do-not-sanitize'],
		sanitizeFileName: false
	}
};
