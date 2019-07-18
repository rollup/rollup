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
		exports.some(expt => {
			if (expt.exported === 'default') {
				local = expt.local;
				return true;
			}
			return false;
		});
		// search for reexported default otherwise
		if (!local) {
			dependencies.some(dep => {
				if (!dep.reexports) return false;
				return dep.reexports.some(expt => {
					if (expt.reexported === 'default') {
						local = dep.namedExportsMode ? `${dep.name}.${expt.imported}` : dep.name;
						return true;
					}
					return false;
				});
			});
		}
		return `${mechanism}${local};`;
	}

	let exportBlock = '';

	// star exports must always output first for precedence
	dependencies.forEach(({ name, reexports }) => {
		if (reexports && namedExportsMode) {
			reexports.forEach(specifier => {
				if (specifier.reexported === '*') {
					if (!compact && exportBlock) exportBlock += '\n';
					exportBlock +=
						`Object.keys(${name}).forEach(function${_}(k)${_}{${n}` +
						`${t}if${_}(k${_}!==${_}'default')${_}Object.defineProperty(exports,${_}k,${_}{${n}` +
						`${t}${t}enumerable:${_}true,${n}` +
						`${t}${t}get:${_}function${_}()${_}{${n}` +
						`${t}${t}${t}return ${name}[k];${n}` +
						`${t}${t}}${n}${t}});${n}});`;
				}
			});
		}
	});

	dependencies.forEach(
		({ name, imports, reexports, isChunk, namedExportsMode: depNamedExportsMode }) => {
			if (reexports && namedExportsMode) {
				reexports.forEach(specifier => {
					if (specifier.imported === 'default' && !isChunk) {
						const exportsNamesOrNamespace =
							(imports && imports.some(specifier => specifier.imported !== 'default')) ||
							(reexports &&
								reexports.some(
									specifier => specifier.imported !== 'default' && specifier.imported !== '*'
								));

						const reexportsDefaultAsDefault =
							reexports &&
							reexports.some(
								specifier => specifier.imported === 'default' && specifier.reexported === 'default'
							);

						if (exportBlock && !compact) exportBlock += '\n';
						if (exportsNamesOrNamespace || reexportsDefaultAsDefault)
							exportBlock += `exports.${specifier.reexported}${_}=${_}${name}${
								interop !== false ? '__default' : '.default'
							};`;
						else exportBlock += `exports.${specifier.reexported}${_}=${_}${name};`;
					} else if (specifier.imported !== '*') {
						if (exportBlock && !compact) exportBlock += '\n';
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
						if (exportBlock && !compact) exportBlock += '\n';
						exportBlock += `exports.${specifier.reexported}${_}=${_}${name};`;
					}
				});
			}
		}
	);

	exports.forEach(expt => {
		const lhs = `exports.${expt.exported}`;
		const rhs = expt.local;
		if (lhs === rhs) {
			return;
		}
		if (exportBlock && !compact) exportBlock += '\n';
		exportBlock += `${lhs}${_}=${_}${rhs};`;
	});

	return exportBlock;
}
