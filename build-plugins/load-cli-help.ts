import { readFile } from 'node:fs/promises';
import type { Plugin } from 'rollup';

const MAX_LINE_LENGTH = 80;

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
				finalHelpFile.split('\n').forEach(line => {
					if (line.length > MAX_LINE_LENGTH) {
						throw new Error(`Help file line exceeds ${MAX_LINE_LENGTH} characters:\n${line}`);
					}
				});
				return `export default ${JSON.stringify(finalHelpFile)};`;
			}
		},
		name: 'load-help.md'
	};
}
