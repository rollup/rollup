import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/types';
import { INTEROP_DEFAULT_VARIABLE } from '../utils/variableNames';
import { FinaliserOptions } from './index';
import { compactEsModuleExport, esModuleExport } from './shared/esModuleExport';
import getExportBlock from './shared/getExportBlock';

export default function cjs(
	magicString: MagicStringBundle,
	{
		dependencies,
		exports,
		hasExports,
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

	if (options.compact) {
		let definingVariable = false;
		importBlock = '';

		dependencies.forEach(
			({
				id,
				namedExportsMode,
				isChunk,
				name,
				reexports,
				imports,
				exportsNames,
				exportsDefault
			}) => {
				if (!reexports && !imports) {
					importBlock += definingVariable ? ';' : ',';
					definingVariable = false;
					importBlock += `require('${id}')`;
				} else {
					importBlock += definingVariable ? ',' : `${importBlock ? ';' : ''}${varOrConst} `;
					definingVariable = true;

					if (!interop || isChunk || !exportsDefault || !namedExportsMode) {
						importBlock += `${name}=require('${id}')`;
					} else {
						needsInterop = true;
						if (exportsNames)
							importBlock += `${name}=require('${id}'),${name}__default=${INTEROP_DEFAULT_VARIABLE}(${name})`;
						else importBlock += `${name}=${INTEROP_DEFAULT_VARIABLE}(require('${id}'))`;
					}
				}
			}
		);
		if (importBlock.length) importBlock += ';';
	} else {
		importBlock = dependencies
			.map(
				({
					id,
					namedExportsMode,
					isChunk,
					name,
					reexports,
					imports,
					exportsNames,
					exportsDefault
				}) => {
					if (!reexports && !imports) return `require('${id}');`;

					if (!interop || isChunk || !exportsDefault || !namedExportsMode)
						return `${varOrConst} ${name} = require('${id}');`;

					needsInterop = true;

					if (exportsNames)
						return (
							`${varOrConst} ${name} = require('${id}');` +
							`\n${varOrConst} ${name}__default = ${INTEROP_DEFAULT_VARIABLE}(${name});`
						);

					return `${varOrConst} ${name} = ${INTEROP_DEFAULT_VARIABLE}(require('${id}'));`;
				}
			)
			.join('\n');
	}

	if (needsInterop) {
		if (options.compact)
			intro += `function ${INTEROP_DEFAULT_VARIABLE}(e){return(e&&(typeof e==='object')&&'default'in e)?e['default']:e}`;
		else
			intro += `function ${INTEROP_DEFAULT_VARIABLE} (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n`;
	}

	if (importBlock) intro += importBlock + n + n;

	const exportBlock = getExportBlock(
		exports,
		dependencies,
		namedExportsMode,
		options.interop,
		options.compact,
		`module.exports${_}=${_}`
	);

	magicString.prepend(intro);

	if (exportBlock) magicString.append(n + n + exportBlock);
	if (outro) magicString.append(outro);

	return magicString;
}
