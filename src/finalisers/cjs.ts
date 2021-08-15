import { Bundle, Bundle as MagicStringBundle } from 'magic-string';
import { ChunkDependencies } from '../Chunk';
import { NormalizedOutputOptions } from '../rollup/types';
import { GenerateCodeSnippets } from '../utils/generateCodeSnippets';
import { getExportBlock, getNamespaceMarkers } from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
import { FinaliserOptions } from './index';

export default function cjs(
	magicString: MagicStringBundle,
	{
		accessedGlobals,
		dependencies,
		exports,
		hasExports,
		indent: t,
		intro,
		isEntryFacade,
		isModuleFacade,
		namedExportsMode,
		outro,
		snippets,
		varOrConst
	}: FinaliserOptions,
	{
		compact,
		esModule,
		externalLiveBindings,
		freeze,
		interop,
		namespaceToStringTag,
		strict
	}: NormalizedOutputOptions
): Bundle {
	const { n, _ } = snippets;

	const useStrict = strict ? `'use strict';${n}${n}` : '';
	let namespaceMarkers = getNamespaceMarkers(
		namedExportsMode && hasExports,
		isEntryFacade && esModule,
		isModuleFacade && namespaceToStringTag,
		_,
		n
	);
	if (namespaceMarkers) {
		namespaceMarkers += n + n;
	}
	const importBlock = getImportBlock(dependencies, snippets, compact, varOrConst);
	const interopBlock = getInteropBlock(
		dependencies,
		varOrConst,
		interop,
		externalLiveBindings,
		freeze,
		namespaceToStringTag,
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
		`module.exports${_}=${_}`
	);

	return magicString.append(`${exportBlock}${outro}`);
}

function getImportBlock(
	dependencies: ChunkDependencies,
	{ n, _ }: GenerateCodeSnippets,
	compact: boolean,
	varOrConst: string
): string {
	let importBlock = '';
	let definingVariable = false;
	for (const { id, name, reexports, imports } of dependencies) {
		if (!reexports && !imports) {
			if (importBlock) {
				importBlock += !compact || definingVariable ? `;${n}` : ',';
			}
			definingVariable = false;
			importBlock += `require('${id}')`;
		} else {
			importBlock +=
				compact && definingVariable ? ',' : `${importBlock ? `;${n}` : ''}${varOrConst} `;
			definingVariable = true;
			importBlock += `${name}${_}=${_}require('${id}')`;
		}
	}
	if (importBlock) {
		return `${importBlock};${n}${n}`;
	}
	return '';
}
