import { Bundle as MagicStringBundle } from 'magic-string';
import { ChunkDependencies } from '../Chunk';
import { NormalizedOutputOptions } from '../rollup/types';
import { FinaliserOptions } from './index';
import { compactEsModuleExport, esModuleExport } from './shared/esModuleExport';
import getExportBlock from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';

export default function cjs(
	magicString: MagicStringBundle,
	{
		accessedGlobals,
		dependencies,
		exports,
		hasExports,
		indentString: t,
		intro,
		isEntryModuleFacade,
		namedExportsMode,
		outro,
		varOrConst
	}: FinaliserOptions,
	{ compact, esModule, externalLiveBindings, freeze, interop, strict }: NormalizedOutputOptions
) {
	const n = compact ? '' : '\n';
	const s = compact ? '' : ';';
	const _ = compact ? '' : ' ';

	const useStrict = strict ? `'use strict';${n}${n}` : '';
	const esModuleProp =
		namedExportsMode && hasExports && isEntryModuleFacade && esModule
			? `${compact ? compactEsModuleExport : esModuleExport}${n}${n}`
			: '';
	const importBlock = getImportBlock(dependencies, compact, varOrConst, n, _);
	const interopBlock = getInteropBlock(
		dependencies,
		varOrConst,
		interop,
		externalLiveBindings,
		freeze,
		accessedGlobals,
		_,
		n,
		s,
		t
	);

	magicString.prepend(`${useStrict}${intro}${esModuleProp}${importBlock}${interopBlock}`);

	const exportBlock = getExportBlock(
		exports,
		dependencies,
		namedExportsMode,
		interop,
		compact,
		t,
		externalLiveBindings,
		`module.exports${_}=${_}`
	);

	return magicString.append(`${exportBlock}${outro}`);
}

function getImportBlock(
	dependencies: ChunkDependencies,
	compact: boolean,
	varOrConst: string,
	n: string,
	_: string
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
