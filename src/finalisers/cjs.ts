import { esModuleExport, compactEsModuleExport } from './shared/esModuleExport';
import { OutputOptions } from '../rollup/types';
import { Bundle as MagicStringBundle } from 'magic-string';
import getExportBlock from './shared/getExportBlock';
import { FinaliserOptions } from './index';

export default function cjs(
	magicString: MagicStringBundle,
	{
		graph,
		isEntryModuleFacade,
		namedExportsMode,
		hasExports,
		intro,
		outro,
		dependencies,
		exports
	}: FinaliserOptions,
	options: OutputOptions
) {
	const n = options.compact ? '' : '\n';
	const _ = options.compact ? '' : ' ';

	intro =
		(options.strict === false ? intro : `'use strict';${n}${n}${intro}`) +
		(namedExportsMode && hasExports && isEntryModuleFacade
			? `${options.compact ? compactEsModuleExport : esModuleExport}${n}${n}`
			: '');

	let needsInterop = false;

	const varOrConst = graph.varOrConst;
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
							importBlock += `${name}=require('${id}'),${name}__default=_interopDefault(${name})`;
						else importBlock += `${name}=_interopDefault(require('${id}'))`;
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
							`\n${varOrConst} ${name}__default = _interopDefault(${name});`
						);

					return `${varOrConst} ${name} = _interopDefault(require('${id}'));`;
				}
			)
			.join('\n');
	}

	if (needsInterop) {
		if (options.compact)
			intro += `function _interopDefault(e){return(e&&(typeof e==='object')&&'default'in e)?e['default']:e}`;
		else
			intro += `function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n`;
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
