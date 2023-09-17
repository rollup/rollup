import { fileURLToPath } from 'node:url';

export const moduleAliases = {
	entries: {
		'help.md': fileURLToPath(new URL('../cli/help.md', import.meta.url)),
		'package.json': fileURLToPath(new URL('../package.json', import.meta.url))
	},
	resolve: ['.js', '.json', '.md']
};
