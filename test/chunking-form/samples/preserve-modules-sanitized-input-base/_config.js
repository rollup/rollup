module.exports = defineTest({
	description: 'sanitizes the input base like module ids when preserving modules (#5446)',
	options: {
		input: ['/virtual/[subject]/src/main.js'],
		output: { preserveModules: true },
		plugins: [
			{
				resolveId(id) {
					if (id.startsWith('/virtual/')) {
						return id;
					}
					if (id === './helper.js') {
						return '/virtual/[subject]/src/helper.js';
					}
				},
				load(id) {
					if (id === '/virtual/[subject]/src/main.js') {
						return `import { helper } from './helper.js'; export default helper;`;
					}
					if (id === '/virtual/[subject]/src/helper.js') {
						return `export const helper = 'helper';`;
					}
				}
			}
		]
	}
});
