import type { Plugin } from 'rollup';

const expectedImports = 3;

export default function esmDynamicImport(): Plugin {
	let importsFound = 0;
	return {
		generateBundle() {
			if (importsFound !== expectedImports) {
				throw new Error(
					`Could not find ${expectedImports} dynamic imports in "loadConfigFile.ts" and "commandPlugin.ts", found ${importsFound}.`
				);
			}
		},
		name: 'esm-dynamic-import',
		renderDynamicImport({ moduleId }) {
			if (moduleId.endsWith('commandPlugins.ts') || moduleId.endsWith('loadConfigFile.ts')) {
				importsFound++;
				return { left: 'import(', right: ')' };
			}
		}
	};
}
