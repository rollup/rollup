import type { Plugin } from 'rollup';

export default function esmDynamicImport(): Plugin {
	let importsFound = 0;
	return {
		generateBundle() {
			if (importsFound !== 2) {
				throw new Error(
					'Could not find 2 dynamic import in "loadConfigFile.ts" and "commandPlugin.ts", were the files renamed or modified?'
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
