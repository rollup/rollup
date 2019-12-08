import { Bundle as MagicStringBundle } from 'magic-string';
import { ChunkDependencies, ChunkExports, ImportSpecifier, ReexportSpecifier } from '../Chunk';
import { OutputOptions } from '../rollup/types';
import { FinaliserOptions } from './index';

export default function esm(
	magicString: MagicStringBundle,
	{ intro, outro, dependencies, exports }: FinaliserOptions,
	options: OutputOptions
) {
	const _ = options.compact ? '' : ' ';
	const n = options.compact ? '' : '\n';

	const importBlock = getImportBlock(dependencies, _);
	if (importBlock.length > 0) intro += importBlock.join(n) + n + n;
	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(exports, _);
	if (exportBlock.length) magicString.append(n + n + exportBlock.join(n).trim());
	if (outro) magicString.append(outro);

	return magicString.trim();
}

function getImportBlock(dependencies: ChunkDependencies, _: string): string[] {
	const importBlock: string[] = [];
	for (const { id, reexports, imports, name } of dependencies) {
		if (!reexports && !imports) {
			importBlock.push(`import${_}'${id}';`);
			continue;
		}
		if (imports) {
			let defaultImport: ImportSpecifier | null = null;
			let starImport: ImportSpecifier | null = null;
			const importedNames: ImportSpecifier[] = [];
			for (const specifier of imports) {
				if (specifier.imported === 'default') {
					defaultImport = specifier;
				} else if (specifier.imported === '*') {
					starImport = specifier;
				} else {
					importedNames.push(specifier);
				}
			}
			if (starImport) {
				importBlock.push(`import${_}*${_}as ${starImport.local} from${_}'${id}';`);
			}
			if (defaultImport && importedNames.length === 0) {
				importBlock.push(`import ${defaultImport.local} from${_}'${id}';`);
			} else if (importedNames.length > 0) {
				importBlock.push(
					`import ${defaultImport ? `${defaultImport.local},${_}` : ''}{${_}${importedNames
						.map(specifier => {
							if (specifier.imported === specifier.local) {
								return specifier.imported;
							} else {
								return `${specifier.imported} as ${specifier.local}`;
							}
						})
						.join(`,${_}`)}${_}}${_}from${_}'${id}';`
				);
			}
		}
		if (reexports) {
			let starExport: ReexportSpecifier | null = null;
			const namespaceReexports: ReexportSpecifier[] = [];
			const namedReexports: ReexportSpecifier[] = [];
			for (const specifier of reexports) {
				if (specifier.reexported === '*') {
					starExport = specifier;
				} else if (specifier.imported === '*') {
					namespaceReexports.push(specifier);
				} else {
					namedReexports.push(specifier);
				}
			}
			if (starExport) {
				importBlock.push(`export${_}*${_}from${_}'${id}';`);
			}
			if (namespaceReexports.length > 0) {
				if (
					!imports ||
					!imports.some(specifier => specifier.imported === '*' && specifier.local === name)
				) {
					importBlock.push(`import${_}*${_}as ${name} from${_}'${id}';`);
				}
				for (const specifier of namespaceReexports) {
					importBlock.push(
						`export${_}{${_}${
							name === specifier.reexported ? name : `${name} as ${specifier.reexported}`
						} };`
					);
				}
			}
			if (namedReexports.length > 0) {
				importBlock.push(
					`export${_}{${_}${namedReexports
						.map(specifier => {
							if (specifier.imported === specifier.reexported) {
								return specifier.imported;
							} else {
								return `${specifier.imported} as ${specifier.reexported}`;
							}
						})
						.join(`,${_}`)}${_}}${_}from${_}'${id}';`
				);
			}
		}
	}
	return importBlock;
}

function getExportBlock(exports: ChunkExports, _: string): string[] {
	const exportBlock: string[] = [];
	const exportDeclaration: string[] = [];
	for (const specifier of exports) {
		if (specifier.exported === 'default') {
			exportBlock.push(`export default ${specifier.local};`);
		} else {
			exportDeclaration.push(
				specifier.exported === specifier.local
					? specifier.local
					: `${specifier.local} as ${specifier.exported}`
			);
		}
	}
	if (exportDeclaration.length) {
		exportBlock.push(`export${_}{${_}${exportDeclaration.join(`,${_}`)}${_}};`);
	}
	return exportBlock;
}
