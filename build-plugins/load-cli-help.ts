import { readFile } from 'node:fs/promises';
import type { Plugin } from 'rollup';

export default function loadCliHelp(): Plugin {
	return {
		async load(id) {
			if (id.endsWith('help.md')) {
				const [helpFile, packageFile] = await Promise.all([
					readFile(id, 'utf8'),
					readFile(new URL('../package.json', import.meta.url), 'utf8')
				]);
				return `export default ${JSON.stringify(
					helpFile
						.replaceAll(/^\/\/[^\n]*\n?/gm, '')
						.replace('__VERSION__', JSON.parse(packageFile).version)
				)};`;
			}
		},
		name: 'load-help.md'
	};
}
