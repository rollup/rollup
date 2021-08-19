import { ChunkDependencies, ChunkExports } from '../../Chunk';
import { GetInterop } from '../../rollup/types';
import { GenerateCodeSnippets } from '../../utils/generateCodeSnippets';
import {
	defaultInteropHelpersByInteropType,
	isDefaultAProperty,
	namespaceInteropHelpersByInteropType
} from '../../utils/interopHelpers';

// TODO Lukas add letters, rework tests for arrow function and prop access
export function getExportBlock(
	exports: ChunkExports,
	dependencies: ChunkDependencies,
	namedExportsMode: boolean,
	interop: GetInterop,
	{
		_,
		s,
		directReturnFunctionRight,
		getDirectReturnFunctionLeft,
		getFunctionIntro,
		getPropertyAccess,
		n
	}: GenerateCodeSnippets,
	t: string,
	externalLiveBindings: boolean,
	mechanism = 'return '
): string {
	if (!namedExportsMode) {
		return `${n}${n}${mechanism}${getSingleDefaultExport(
			exports,
			dependencies,
			interop,
			externalLiveBindings,
			getPropertyAccess
		)};`;
	}

	let exportBlock = '';

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
						externalLiveBindings,
						getPropertyAccess
					);
					if (exportBlock) exportBlock += n;
					exportBlock +=
						specifier.imported !== '*' && specifier.needsLiveBinding
							? `Object.defineProperty(exports,${_}'${specifier.reexported}',${_}{${n}` +
							  `${t}enumerable:${_}true,${n}` +
							  `${t}get:${_}${getDirectReturnFunctionLeft([], {
									functionReturn: true
							  })}${importName}${directReturnFunctionRight}${n}});`
							: `exports${getPropertyAccess(specifier.reexported)}${_}=${_}${importName};`;
				}
			}
		}
	}

	for (const { exported, local } of exports) {
		const lhs = `exports${getPropertyAccess(exported)}`;
		const rhs = local;
		if (lhs !== rhs) {
			if (exportBlock) exportBlock += n;
			exportBlock += `${lhs}${_}=${_}${rhs};`;
		}
	}

	for (const { name, reexports } of dependencies) {
		if (reexports && namedExportsMode) {
			for (const specifier of reexports) {
				if (specifier.reexported === '*') {
					if (exportBlock) exportBlock += n;
					const defineProperty = specifier.needsLiveBinding
						? `Object.defineProperty(exports,${_}k,${_}{${n}` +
						  `${t}${t}enumerable:${_}true,${n}` +
						  `${t}${t}get:${_}${getDirectReturnFunctionLeft([], {
								functionReturn: true
						  })}${name}[k]${directReturnFunctionRight}${n}${t}})`
						: `exports[k]${_}=${_}${name}[k]`;
					exportBlock +=
						`Object.keys(${name}).forEach(${getFunctionIntro(['k'])}{${n}` +
						`${t}if${_}(k${_}!==${_}'default'${_}&&${_}!exports.hasOwnProperty(k))${_}${defineProperty}${s}${n}});`;
				}
			}
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
	externalLiveBindings: boolean,
	getPropertyAccess: (name: string) => string
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
					externalLiveBindings,
					getPropertyAccess
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
	externalLiveBindings: boolean,
	getPropertyAccess: (name: string) => string
) {
	if (imported === 'default') {
		if (!isChunk) {
			const moduleInterop = String(interop(moduleId));
			const variableName = defaultInteropHelpersByInteropType[moduleInterop]
				? defaultVariableName
				: moduleVariableName;
			return isDefaultAProperty(moduleInterop, externalLiveBindings)
				? `${variableName}${getPropertyAccess('default')}`
				: variableName;
		}
		// TODO Lukas property access, needs extra testing
		return depNamedExportsMode ? `${moduleVariableName}['default']` : moduleVariableName;
	}
	if (imported === '*') {
		return (
			isChunk
				? !depNamedExportsMode
				: namespaceInteropHelpersByInteropType[String(interop(moduleId))]
		)
			? namespaceVariableName
			: moduleVariableName;
	}
	return `${moduleVariableName}${getPropertyAccess(imported)}`;
}

function getEsModuleExport(_: string): string {
	return `Object.defineProperty(exports,${_}'__esModule',${_}{${_}value:${_}true${_}});`;
}

function getNamespaceToStringExport(_: string): string {
	return `exports[Symbol.toStringTag]${_}=${_}'Module';`;
}

export function getNamespaceMarkers(
	hasNamedExports: boolean,
	addEsModule: boolean,
	addNamespaceToStringTag: boolean,
	_: string,
	n: string
): string {
	let namespaceMarkers = '';
	if (hasNamedExports) {
		if (addEsModule) {
			namespaceMarkers += getEsModuleExport(_);
		}
		if (addNamespaceToStringTag) {
			if (namespaceMarkers) {
				namespaceMarkers += n;
			}
			namespaceMarkers += getNamespaceToStringExport(_);
		}
	}
	return namespaceMarkers;
}
