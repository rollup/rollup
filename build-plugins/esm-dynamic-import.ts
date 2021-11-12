import { Plugin } from 'rollup';

export default function addBinShebangAndEsmImport(): Plugin {
	let importFound = false;
	return {
		generateBundle() {
			if (!importFound) {
				throw new Error(
					'Could not find dynamic import in "loadConfigFile.ts", was the file renamed?'
				);
			}
		},
		name: 'esm-dynamic-import',
		renderDynamicImport({ moduleId }) {
			importFound = true;
			if (moduleId.endsWith('commandPlugins.ts') || moduleId.endsWith('loadConfigFile.ts')) {
				return { left: 'import(', right: ')' };
			}
		}
	};
}
