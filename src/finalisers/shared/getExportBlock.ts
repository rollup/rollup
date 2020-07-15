import { ChunkDependencies, ChunkExports } from '../../Chunk';

export default function getExportBlock(
	exports: ChunkExports,
	dependencies: ChunkDependencies,
	namedExportsMode: boolean,
	interop: boolean | undefined,
	compact: boolean | undefined,
	t: string,
	mechanism = 'return '
) {
	const _ = compact ? '' : ' ';
	const n = compact ? '' : '\n';
	if (!namedExportsMode) {
		let local;
		if (exports.length > 0) {
			local = exports[0].local;
		} else {
			for (const {
				defaultVariableName,
				isChunk,
				name,
				namedExportsMode,
				namespaceVariableName,
				reexports
			} of dependencies) {
				if (reexports) {
					const expt = reexports[0];
					// TODO Lukas test
					if (interop && !isChunk && expt.imported === 'default') {
						local = `${defaultVariableName}['default']`;
					} else if (interop && !isChunk && expt.imported === '*') {
						local = namespaceVariableName;
					} else if (namedExportsMode && expt.imported !== '*') {
						local = `${name}.${expt.imported}`;
					} else {
						local = name;
					}
					break;
				}
			}
		}
		return `${n}${n}${mechanism}${local};`;
	}

	let exportBlock = '';

	// star exports must always output first for precedence
	for (const { name, reexports } of dependencies) {
		if (reexports && namedExportsMode) {
			for (const specifier of reexports) {
				if (specifier.reexported === '*') {
					if (exportBlock) exportBlock += n;
					if (specifier.needsLiveBinding) {
						exportBlock +=
							`Object.keys(${name}).forEach(function${_}(k)${_}{${n}` +
							`${t}if${_}(k${_}!==${_}'default')${_}Object.defineProperty(exports,${_}k,${_}{${n}` +
							`${t}${t}enumerable:${_}true,${n}` +
							`${t}${t}get:${_}function${_}()${_}{${n}` +
							`${t}${t}${t}return ${name}[k];${n}` +
							`${t}${t}}${n}${t}});${n}});`;
					} else {
						exportBlock +=
							`Object.keys(${name}).forEach(function${_}(k)${_}{${n}` +
							`${t}if${_}(k${_}!==${_}'default')${_}exports[k]${_}=${_}${name}[k];${n}});`;
					}
				}
			}
		}
	}

	// TODO Lukas test everything with interop turned off
	// TODO Lukas use old interop if externalLiveBindings are false
	for (const {
		defaultVariableName,
		isChunk,
		name,
		namedExportsMode: depNamedExportsMode,
		namespaceVariableName,
		reexports
	} of dependencies) {
		if (reexports && namedExportsMode) {
			for (const specifier of reexports) {
				if (specifier.imported !== '*') {
					if (exportBlock) exportBlock += n;
					const importName =
						specifier.imported === 'default'
							? depNamedExportsMode
								? `${interop && !isChunk ? defaultVariableName : name}['default']`
								: name
							: `${name}.${specifier.imported}`;
					exportBlock += specifier.needsLiveBinding
						? `Object.defineProperty(exports,${_}'${specifier.reexported}',${_}{${n}` +
						  `${t}enumerable:${_}true,${n}` +
						  `${t}get:${_}function${_}()${_}{${n}` +
						  `${t}${t}return ${importName};${n}${t}}${n}});`
						: `exports.${specifier.reexported}${_}=${_}${importName};`;
				} else if (specifier.reexported !== '*') {
					if (exportBlock) exportBlock += n;
					exportBlock += `exports.${specifier.reexported}${_}=${_}${
						interop && !isChunk ? namespaceVariableName : name
					};`;
				}
			}
		}
	}

	for (const expt of exports) {
		const lhs = `exports.${expt.exported}`;
		const rhs = expt.local;
		if (lhs !== rhs) {
			if (exportBlock) exportBlock += n;
			exportBlock += `${lhs}${_}=${_}${rhs};`;
		}
	}

	if (exportBlock) {
		return `${n}${n}${exportBlock}`;
	}

	return '';
}
