import { readdir, readFile } from 'node:fs/promises';
import alias from '@rollup/plugin-alias';
import { defineConfig } from 'vite';
import { moduleAliases } from '../build-plugins/aliases';
import { resolutions } from '../build-plugins/replace-browser-modules';
import type { Example, Module } from './types';

const examplesDirectory = new URL('repl/examples', import.meta.url);

export default defineConfig({
	plugins: [
		{
			apply: 'serve',
			enforce: 'pre',
			name: 'replace-browser-modules',
			resolveId(source, importer) {
				if (importer && source.startsWith('/@fs')) {
					const resolved = source.slice(4);
					if (resolutions[resolved]) {
						return resolutions[resolved];
					}
				}
			},
			transformIndexHtml(html) {
				// Unfortunately, picomatch sneaks as a dedendency into the dev bundle.
				// This fixes an error.
				return html.replace('</head>', '<script>window.process={}</script></head>');
			}
		},
		{
			apply: 'build',
			enforce: 'pre',
			name: 'replace-local-rollup',
			resolveId(source) {
				if (source.includes('/browser-entry')) {
					return false;
				}
			}
		},
		{
			async load(id) {
				if (id === 'examples.json') {
					const exampleFiles = await getFilesInDirectory(examplesDirectory);
					const examples: Example[] = await Promise.all(
						exampleFiles.map(async id => {
							const {
								entryModules = ['main.js'],
								title
							}: {
								entryModules?: string[];
								title: string;
							} = JSON.parse(
								await readFile(new URL(`examples/${id}/example.json`, examplesDirectory), 'utf8')
							);
							const moduleFiles = await getFilesInDirectory(
								new URL(`examples/${id}/modules`, examplesDirectory)
							);
							const modules: Module[] = await Promise.all(
								moduleFiles.map(async name => {
									const code = (
										await readFile(
											new URL(`examples/${id}/modules/${name}`, examplesDirectory),
											'utf8'
										)
									).trim();
									return { code, isEntry: entryModules.includes(name), name };
								})
							);

							modules.sort((a, b) => {
								if (a.name === 'main.js') return -1;
								if (b.name === 'main.js') return 1;
								if (a.isEntry) return -1;
								if (b.isEntry) return 1;
								return a.name < b.name ? -1 : 1;
							});

							return { id, modules, title };
						})
					);
					const examplesById: Record<string, Example> = {};
					for (const example of examples) {
						examplesById[example.id] = example;
					}
					return JSON.stringify(examplesById);
				}
			},
			name: 'examples',
			resolveId(source) {
				if (source === 'examples.json') {
					return source;
				}
			}
		},
		alias(moduleAliases) as any
	]
});

async function getFilesInDirectory(directory: URL): Promise<string[]> {
	return (await readdir(directory)).filter(file => file[0] !== '.');
}
