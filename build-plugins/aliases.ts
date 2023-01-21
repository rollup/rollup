import { fileURLToPath } from 'node:url';

export const moduleAliases = {
	entries: {
		acorn: fileURLToPath(new URL('../node_modules/acorn/dist/acorn.mjs', import.meta.url)),
		'help.md': fileURLToPath(new URL('../cli/help.md', import.meta.url)),
		'package.json': fileURLToPath(new URL('../package.json', import.meta.url))
	},
	resolve: ['.js', '.json', '.md']
};
