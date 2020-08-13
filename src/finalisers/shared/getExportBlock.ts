import { ChunkDependencies, ChunkExports } from '../../Chunk';
import { GetInterop } from '../../rollup/types';
import {
	defaultInteropHelpersByInteropType,
	isDefaultAProperty,
	namespaceInteropHelpersByInteropType
} from '../../utils/interopHelpers';

export default function getExportBlock(
	exports: ChunkExports,
	dependencies: ChunkDependencies,
	namedExportsMode: boolean,
	interop: GetInterop,
	compact: boolean | undefined,
	t: string,
	externalLiveBindings: boolean,
	mechanism = 'return '
) {
	const _ = compact ? '' : ' ';
	const n = compact ? '' : '\n';
	if (!namedExportsMode) {
		return `${n}${n}${mechanism}${getSingleDefaultExport(
			exports,
			dependencies,
			interop,
			externalLiveBindings
		)};`;
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
				if (specifier.reexported !== '*') {
					const importName = getReexportedImportName(
						name,
						specifier.imported,
						depNamedExportsMode,
						isChunk,
						defaultVariableName!,
						namespaceVariableName!,
						interop,
						id,
						externalLiveBindings
					);
					if (exportBlock) exportBlock += n;
					exportBlock +=
						specifier.imported !== '*' && specifier.needsLiveBinding
							? `Object.defineProperty(exports,${_}'${specifier.reexported}',${_}{${n}` +
							  `${t}enumerable:${_}true,${n}` +
							  `${t}get:${_}function${_}()${_}{${n}` +
							  `${t}${t}return ${importName};${n}${t}}${n}});`
							: `exports.${specifier.reexported}${_}=${_}${importName};`;
				}
			}
		}
	}

	for (const chunkExport of exports) {
		const lhs = `exports.${chunkExport.exported}`;
		const rhs = chunkExport.local;
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

function getSingleDefaultExport(
	exports: ChunkExports,
	dependencies: ChunkDependencies,
	interop: GetInterop,
	externalLiveBindings: boolean
) {
	if (exports.length > 0) {
		return exports[0].local;
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
				return getReexportedImportName(
					name,
					reexports[0].imported,
					depNamedExportsMode,
					isChunk,
					defaultVariableName!,
					namespaceVariableName!,
					interop,
					id,
					externalLiveBindings
				);
			}
		}
	}
}

function getReexportedImportName(
	moduleVariableName: string,
	imported: string,
	depNamedExportsMode: boolean,
	isChunk: boolean,
	defaultVariableName: string,
	namespaceVariableName: string,
	interop: GetInterop,
	moduleId: string,
	externalLiveBindings: boolean
) {
	if (imported === 'default') {
		if (!isChunk) {
			const moduleInterop = String(interop(moduleId));
			const variableName = defaultInteropHelpersByInteropType[moduleInterop]
				? defaultVariableName
				: moduleVariableName;
			return isDefaultAProperty(moduleInterop, externalLiveBindings)
				? `${variableName}['default']`
				: variableName;
		}
		return depNamedExportsMode ? `${moduleVariableName}['default']` : moduleVariableName;
	}
	if (imported === '*') {
		return !isChunk && namespaceInteropHelpersByInteropType[String(interop(moduleId))]
			? namespaceVariableName
			: moduleVariableName;
	}
	return `${moduleVariableName}.${imported}`;
}
