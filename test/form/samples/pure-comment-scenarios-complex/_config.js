// tests compiled from https://github.com/mishoo/UglifyJS2/blob/bcebacbb9e7ddac7d9c0e4ca2c7e0faf0e0bca7c/test/compress/issue-1261.js

module.exports = defineTest({
	description: 'correctly handles various advanced pure comment scenarios',
	expectedWarnings: ['INVALID_ANNOTATION']
});
