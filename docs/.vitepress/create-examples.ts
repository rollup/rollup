import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import type { RollupOptions } from '../../src/rollup/types';
import type { Example, Module } from '../types';
import { getFilesInDirectory } from './helpers';

const examplesDirectory = new URL('../repl/examples', import.meta.url);

export function examplesPlugin(): Plugin {
	return {
		async load(id) {
			if (id === 'examples.json') {
				const exampleFiles = await getFilesInDirectory(examplesDirectory);
				const examples: Example[] = await Promise.all(
					exampleFiles.map(async id => {
						const {
							entryModules = ['main.js'],
							options = {},
							title
						}: {
							entryModules?: string[];
							options?: RollupOptions;
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

						return { id, modules, options, title };
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
	};
}
