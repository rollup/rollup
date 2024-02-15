import type { Bundle as MagicStringBundle } from 'magic-string';
import type { ChunkDependency } from '../Chunk';
import type { NormalizedOutputOptions } from '../rollup/types';
import type { GenerateCodeSnippets } from '../utils/generateCodeSnippets';
import { getExportBlock, getNamespaceMarkers } from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
import type { FinaliserOptions } from './index';

export default function cjs(
	magicString: MagicStringBundle,
	{
		accessedGlobals,
		dependencies,
		exports,
		hasDefaultExport,
		hasExports,
		indent: t,
		intro,
		isEntryFacade,
		isModuleFacade,
		namedExportsMode,
		outro,
		snippets
	}: FinaliserOptions,
	{
		compact,
		esModule,
		externalLiveBindings,
		freeze,
		interop,
		generatedCode: { symbols },
		reexportProtoFromExternal,
		strict
	}: NormalizedOutputOptions
): void {
	const { _, n } = snippets;

	const useStrict = strict ? `'use strict';${n}${n}` : '';
	let namespaceMarkers = getNamespaceMarkers(
		namedExportsMode && hasExports,
		isEntryFacade && (esModule === true || (esModule === 'if-default-prop' && hasDefaultExport)),
		isModuleFacade && symbols,
		snippets
	);
	if (namespaceMarkers) {
		namespaceMarkers += n + n;
	}
	const importBlock = getImportBlock(dependencies, snippets, compact);
	const interopBlock = getInteropBlock(
		dependencies,
		interop,
		externalLiveBindings,
		freeze,
		symbols,
		accessedGlobals,
		t,
		snippets
	);

	magicString.prepend(`${useStrict}${intro}${namespaceMarkers}${importBlock}${interopBlock}`);

	const exportBlock = getExportBlock(
		exports,
		dependencies,
		namedExportsMode,
		interop,
		snippets,
		t,
		externalLiveBindings,
		reexportProtoFromExternal,
		`module.exports${_}=${_}`
	);

	magicString.append(`${exportBlock}${outro}`);
}

function getImportBlock(
	dependencies: readonly ChunkDependency[],
	{ _, cnst, n }: GenerateCodeSnippets,
	compact: boolean
): string {
	let importBlock = '';
	let definingVariable = false;
	for (const { importPath, name, reexports, imports } of dependencies) {
		if (!reexports && !imports) {
			if (importBlock) {
				importBlock += compact && !definingVariable ? ',' : `;${n}`;
			}
			definingVariable = false;
			importBlock += `require('${importPath}')`;
		} else {
			importBlock += compact && definingVariable ? ',' : `${importBlock ? `;${n}` : ''}${cnst} `;
			definingVariable = true;
			importBlock += `${name}${_}=${_}require('${importPath}')`;
		}
	}
	if (importBlock) {
		return `${importBlock};${n}${n}`;
	}
	return '';
}
