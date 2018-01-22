import { Bundle as MagicStringBundle } from 'magic-string';
import Chunk from '../Chunk';

export default function es (chunk: Chunk, magicString: MagicStringBundle, { getPath, intro, outro }: {
	exportMode: string;
	indentString: string;
	getPath: (name: string) => string;
	intro: string;
	outro: string
}) {
	const { dependencies, exports } = chunk.getModuleDeclarations();
	const importBlock = dependencies.map(({ id, reexports, imports }) => {
		if (!reexports && !imports) {
			return `import '${getPath(id)}';`;
		}
		let output = '';
		if (imports) {
			const defaultImport = imports.find(specifier => specifier.imported === 'default');
			const starImport = imports.find(specifier => specifier.imported === '*');
			if (starImport) {
				output += `import * as ${starImport.local} from '${getPath(id)}';`;
			} else if (defaultImport && imports.length === 1) {
				output += `import ${defaultImport.local} from '${getPath(id)}';`;
			} else {
				output += `import ${defaultImport ? `${defaultImport.local}, ` : ''}{ ${imports
					.filter(specifier => specifier !== defaultImport)
					.map(specifier => {
						if (specifier.imported === specifier.local) {
							return specifier.imported;
						} else {
							return `${specifier.imported} as ${specifier.local}`;
						}
					})
					.join(', ')} } from '${getPath(id)}';`;
			}
		}
		if (reexports) {
			const starExport = reexports.find(specifier => specifier.reexported === '*');
			if (starExport) {
				output += `export * from '${id}';`;
				if (reexports.length === 1) {
					return output;
				}
				output += '\n';
			}
			output += `export { ${reexports
				.filter(specifier => specifier !== starExport)
				.map(specifier => {
					if (specifier.imported === specifier.reexported) {
						return specifier.imported;
					} else {
						return `${specifier.imported} as ${specifier.reexported}`;
					}
				})
				.join(', ')} } from '${getPath(id)}';`;
		}
		return output;
	}).join('\n');

	if (importBlock) intro += importBlock + '\n\n';
	if (intro) magicString.prepend(intro);

	const exportBlock: string[] = [];
	const exportDeclaration: string[] = [];
	exports.forEach(specifier => {
		if (specifier.exported === 'default') {
			exportBlock.push(`export default ${specifier.local};`);
		} else {
			exportDeclaration.push(specifier.exported === specifier.local ? specifier.local : `${specifier.local} as ${specifier.exported}`);
		}
	});
	if (exportDeclaration.length) {
		exportBlock.push(`export { ${exportDeclaration.join(', ')} };`);
	}

	if (exportBlock.length)
		(<any> magicString).append('\n\n' + exportBlock.join('\n').trim()); // TODO TypeScript: Awaiting PR

	if (outro) (<any> magicString).append(outro); // TODO TypeScript: Awaiting PR

	return (<any> magicString).trim(); // TODO TypeScript: Awaiting PR
}
