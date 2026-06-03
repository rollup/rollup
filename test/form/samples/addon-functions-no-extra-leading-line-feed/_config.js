module.exports = defineTest({
	description: 'Does not add an extra leading line feed for addons',
	options: {
		plugins: [
			{
				name: 'first',
				intro(chunk) {
					return `/* intro-first ${chunk.fileName} */`;
				},
				outro(chunk) {
					return `/* outro-first ${chunk.fileName} */`;
				},
				banner(chunk) {
					return `/* banner-first ${chunk.fileName} */`;
				},
				footer(chunk) {
					return `/* footer-first ${chunk.fileName} */`;
				}
			},
			{
				name: 'second',
				intro(chunk) {
					return `/* intro-second ${chunk.fileName} */`;
				},
				outro(chunk) {
					return `/* outro-second ${chunk.fileName} */`;
				},
				banner(chunk) {
					return `/* banner-second ${chunk.fileName} */`;
				},
				footer(chunk) {
					return `/* footer-second ${chunk.fileName} */`;
				}
			}
		]
	}
});
