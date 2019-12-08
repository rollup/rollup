import { ChunkDependencies, ChunkExports } from '../../Chunk';

export default function getExportBlock(
	exports: ChunkExports,
	dependencies: ChunkDependencies,
	namedExportsMode: boolean,
	interop: boolean,
	compact: boolean,
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
			for (const dep of dependencies) {
				if (dep.reexports) {
					const expt = dep.reexports[0];
					local =
						dep.namedExportsMode && expt.imported !== '*' && expt.imported !== 'default'
							? `${dep.name}.${expt.imported}`
							: dep.name;
					break;
				}
			}
		}
		return `${mechanism}${local};`;
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

	for (const {
		name,
		imports,
		reexports,
		isChunk,
		namedExportsMode: depNamedExportsMode,
		exportsNames
	} of dependencies) {
		if (reexports && namedExportsMode) {
			for (const specifier of reexports) {
				if (specifier.imported === 'default' && !isChunk) {
					if (exportBlock) exportBlock += n;
					if (
						exportsNames &&
						(reexports.some(specifier =>
							specifier.imported === 'default'
								? specifier.reexported === 'default'
								: specifier.imported !== '*'
						) ||
							(imports && imports.some(specifier => specifier.imported !== 'default')))
					) {
						exportBlock += `exports.${specifier.reexported}${_}=${_}${name}${
							interop !== false ? '__default' : '.default'
						};`;
					} else {
						exportBlock += `exports.${specifier.reexported}${_}=${_}${name};`;
					}
				} else if (specifier.imported !== '*') {
					if (exportBlock) exportBlock += n;
					const importName =
						specifier.imported === 'default' && !depNamedExportsMode
							? name
							: `${name}.${specifier.imported}`;
					exportBlock += specifier.needsLiveBinding
						? `Object.defineProperty(exports,${_}'${specifier.reexported}',${_}{${n}` +
						  `${t}enumerable:${_}true,${n}` +
						  `${t}get:${_}function${_}()${_}{${n}` +
						  `${t}${t}return ${importName};${n}${t}}${n}});`
						: `exports.${specifier.reexported}${_}=${_}${importName};`;
				} else if (specifier.reexported !== '*') {
					if (exportBlock) exportBlock += n;
					exportBlock += `exports.${specifier.reexported}${_}=${_}${name};`;
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

	return exportBlock;
}
