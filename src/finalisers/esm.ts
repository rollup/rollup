import { Bundle as MagicStringBundle } from 'magic-string';
import { FinaliserOptions } from './index';

export * from 'magic-string';
import { OutputOptions } from '../rollup/types';

export default function esm(
	magicString: MagicStringBundle,
	{ intro, outro, dependencies, exports }: FinaliserOptions,
	options: OutputOptions
) {
	const _ = options.compact ? '' : ' ';
	const n = options.compact ? '' : '\n';

	const importBlock = dependencies
		.map(({ id, reexports, imports, name }) => {
			if (!reexports && !imports) {
				return `import${_}'${id}';`;
			}
			let output = '';
			if (imports) {
				const defaultImport = imports.find(specifier => specifier.imported === 'default');
				const starImport = imports.find(specifier => specifier.imported === '*');
				if (starImport) {
					output += `import${_}*${_}as ${starImport.local} from${_}'${id}';`;
					if (imports.length > 1) output += n;
				}
				if (defaultImport && imports.length === 1) {
					output += `import ${defaultImport.local} from${_}'${id}';`;
				} else if (!starImport || imports.length > 1) {
					output += `import ${defaultImport ? `${defaultImport.local},${_}` : ''}{${_}${imports
						.filter(specifier => specifier !== defaultImport && specifier !== starImport)
						.map(specifier => {
							if (specifier.imported === specifier.local) {
								return specifier.imported;
							} else {
								return `${specifier.imported} as ${specifier.local}`;
							}
						})
						.join(`,${_}`)}${_}}${_}from${_}'${id}';`;
				}
			}
			if (reexports) {
				if (imports) output += n;
				const starExport = reexports.find(specifier => specifier.reexported === '*');
				const namespaceReexport = reexports.find(
					specifier => specifier.imported === '*' && specifier.reexported !== '*'
				);
				if (starExport) {
					output += `export${_}*${_}from${_}'${id}';`;
					if (reexports.length === 1) {
						return output;
					}
					output += n;
				}
				if (namespaceReexport) {
					if (
						!imports ||
						!imports.some(specifier => specifier.imported === '*' && specifier.local === name)
					)
						output += `import${_}*${_}as ${name} from${_}'${id}';${n}`;
					output += `export${_}{${_}${
						name === namespaceReexport.reexported
							? name
							: `${name} as ${namespaceReexport.reexported}`
					} };`;
					if (reexports.length === (starExport ? 2 : 1)) {
						return output;
					}
					output += n;
				}
				output += `export${_}{${_}${reexports
					.filter(specifier => specifier !== starExport && specifier !== namespaceReexport)
					.map(specifier => {
						if (specifier.imported === specifier.reexported) {
							return specifier.imported;
						} else {
							return `${specifier.imported} as ${specifier.reexported}`;
						}
					})
					.join(`,${_}`)}${_}}${_}from${_}'${id}';`;
			}
			return output;
		})
		.join(n);

	if (importBlock) intro += importBlock + n + n;
	if (intro) magicString.prepend(intro);

	const exportBlock: string[] = [];
	const exportDeclaration: string[] = [];
	exports.forEach(specifier => {
		if (specifier.exported === 'default') {
			exportBlock.push(`export default ${specifier.local};`);
		} else {
			exportDeclaration.push(
				specifier.exported === specifier.local
					? specifier.local
					: `${specifier.local} as ${specifier.exported}`
			);
		}
	});
	if (exportDeclaration.length) {
		exportBlock.push(`export${_}{${_}${exportDeclaration.join(`,${_}`)}${_}};`);
	}

	if (exportBlock.length) magicString.append(n + n + exportBlock.join(n).trim());

	if (outro) magicString.append(outro);

	return magicString.trim();
}
