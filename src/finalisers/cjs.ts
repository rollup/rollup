import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/types';
import { INTEROP_DEFAULT_VARIABLE, INTEROP_NAMESPACE_VARIABLE } from '../utils/variableNames';
import { FinaliserOptions } from './index';
import { compactEsModuleExport, esModuleExport } from './shared/esModuleExport';
import getExportBlock from './shared/getExportBlock';
import { getInteropNamespace } from './shared/getInteropNamespace';

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
	options: OutputOptions
) {
	const n = options.compact ? '' : '\n';
	const _ = options.compact ? '' : ' ';

	intro =
		(options.strict === false ? intro : `'use strict';${n}${n}${intro}`) +
		(namedExportsMode && hasExports && isEntryModuleFacade && options.esModule
			? `${options.compact ? compactEsModuleExport : esModuleExport}${n}${n}`
			: '');

	let needsInterop = false;
	const interop = options.interop !== false;
	let importBlock: string;

	let definingVariable = false;
	importBlock = '';
	for (const {
		id,
		namedExportsMode,
		isChunk,
		name,
		reexports,
		imports,
		exportsNames,
		exportsDefault
	} of dependencies) {
		if (!reexports && !imports) {
			if (importBlock) {
				importBlock += !options.compact || definingVariable ? `;${n}` : ',';
			}
			definingVariable = false;
			importBlock += `require('${id}')`;
		} else {
			importBlock +=
				options.compact && definingVariable ? ',' : `${importBlock ? `;${n}` : ''}${varOrConst} `;
			definingVariable = true;

			if (!interop || isChunk || !exportsDefault || !namedExportsMode) {
				importBlock += `${name}${_}=${_}require('${id}')`;
			} else {
				needsInterop = true;
				if (exportsNames)
					importBlock += `${name}${_}=${_}require('${id}')${
						options.compact ? ',' : `;\n${varOrConst} `
					}${name}__default${_}=${_}${INTEROP_DEFAULT_VARIABLE}(${name})`;
				else importBlock += `${name}${_}=${_}${INTEROP_DEFAULT_VARIABLE}(require('${id}'))`;
			}
		}
	}
	if (importBlock) importBlock += ';';

	if (needsInterop) {
		const ex = options.compact ? 'e' : 'ex';
		intro +=
			`function ${INTEROP_DEFAULT_VARIABLE}${_}(${ex})${_}{${_}return${_}` +
			`(${ex}${_}&&${_}(typeof ${ex}${_}===${_}'object')${_}&&${_}'default'${_}in ${ex})${_}` +
			`?${_}${ex}['default']${_}:${_}${ex}${options.compact ? '' : '; '}}${n}${n}`;
	}
	if (accessedGlobals.has(INTEROP_NAMESPACE_VARIABLE)) {
		intro += getInteropNamespace(_, n, t);
	}

	if (importBlock) intro += importBlock + n + n;

	const exportBlock = getExportBlock(
		exports,
		dependencies,
		namedExportsMode,
		options.interop as boolean,
		options.compact as boolean,
		t,
		`module.exports${_}=${_}`
	);

	magicString.prepend(intro);

	if (exportBlock) magicString.append(n + n + exportBlock);
	if (outro) magicString.append(outro);

	return magicString;
}
