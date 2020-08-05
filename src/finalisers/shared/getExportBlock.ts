import { ChunkDependencies, ChunkExports } from '../../Chunk';
import { GetInterop } from '../../rollup/types';
import {
	defaultInteropHelpersByInteropType,
	defaultIsPropertyByInteropType,
	namespaceInteropHelpersByInteropType
} from '../../utils/interopHelpers';

export default function getExportBlock(
	exports: ChunkExports,
	dependencies: ChunkDependencies,
	namedExportsMode: boolean,
	interop: GetInterop,
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
				id,
				isChunk,
				name,
				namedExportsMode: depNamedExportsMode,
				namespaceVariableName,
				reexports
			} of dependencies) {
				if (reexports) {
					const reexport = reexports[0];
					if (!isChunk) {
						const moduleInterop = String(interop(id));
						if (reexport.imported === 'default') {
							const variableName = defaultInteropHelpersByInteropType[moduleInterop]
								? defaultVariableName
								: name;
							local = defaultIsPropertyByInteropType[moduleInterop]
								? `${variableName}['default']`
								: variableName;
							break;
						}
						if (reexport.imported === '*') {
							local = defaultInteropHelpersByInteropType[moduleInterop]
								? namespaceVariableName
								: name;
							break;
						}
					}
					if (depNamedExportsMode && reexport.imported !== '*') {
						local = `${name}.${reexport.imported}`;
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

	// TODO Lukas use old interop if externalLiveBindings are false
	for (const {
		defaultVariableName,
		id,
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
					const importName = getReexportedImportName(
						name,
						specifier.imported,
						depNamedExportsMode,
						isChunk,
						defaultVariableName!,
						interop,
						id
					);
					exportBlock += specifier.needsLiveBinding
						? `Object.defineProperty(exports,${_}'${specifier.reexported}',${_}{${n}` +
						  `${t}enumerable:${_}true,${n}` +
						  `${t}get:${_}function${_}()${_}{${n}` +
						  `${t}${t}return ${importName};${n}${t}}${n}});`
						: `exports.${specifier.reexported}${_}=${_}${importName};`;
				} else if (specifier.reexported !== '*') {
					if (exportBlock) exportBlock += n;
					exportBlock += `exports.${specifier.reexported}${_}=${_}${getReexportedNamespaceName(
						name,
						isChunk,
						namespaceVariableName!,
						interop,
						id
					)};`;
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

function getReexportedImportName(
	name: string,
	imported: string,
	namedExportsModule: boolean,
	isChunk: boolean,
	defaultVariableName: string,
	interop: GetInterop,
	moduleId: string
) {
	if (imported === 'default') {
		if (!isChunk) {
			const moduleInterop = String(interop(moduleId));
			const variableName = defaultInteropHelpersByInteropType[moduleInterop]
				? defaultVariableName
				: name;
			return defaultIsPropertyByInteropType[moduleInterop]
				? `${variableName}['default']`
				: variableName;
		}
		return namedExportsModule ? `${name}['default']` : name;
	}
	return `${name}.${imported}`;
}

// TODO Lukas handle chunks with default export mode
function getReexportedNamespaceName(
	name: string,
	isChunk: boolean,
	namespaceVariableName: string,
	interop: GetInterop,
	moduleId: string
) {
	if (!isChunk && namespaceInteropHelpersByInteropType[String(interop(moduleId))]) {
		return namespaceVariableName;
	}
	return name;
}
