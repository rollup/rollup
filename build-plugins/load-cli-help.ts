import { readFile } from 'node:fs/promises';
import type { Plugin } from 'rollup';

export default function loadCliHelp(): Plugin {
	return {
		async load(id) {
			if (id.endsWith('help.md')) {
				const [rawHelpFile, packageFile] = await Promise.all([
					readFile(id, 'utf8'),
					readFile(new URL('../package.json', import.meta.url), 'utf8')
				]);
				const finalHelpFile = rawHelpFile
					.replaceAll(/^\/\/[^\n]*\n?/gm, '')
					.replace('__VERSION__', JSON.parse(packageFile).version);
				return `export default ${JSON.stringify(finalHelpFile)};`;
			}
		},
		name: 'load-cli-help'
	};
}
