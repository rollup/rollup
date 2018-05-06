import esModuleExport from './shared/esModuleExport';
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
	intro =
		(options.strict === false ? intro : `'use strict';\n\n${intro}`) +
		(namedExportsMode && hasExports && options.legacy !== true && isEntryModuleFacade
			? `${esModuleExport}\n\n`
			: '');

	let needsInterop = false;

	const varOrConst = graph.varOrConst;
	const interop = options.interop !== false;

	const importBlock = dependencies
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
				if (!reexports && !imports) {
					return `require('${id}');`;
				}

				if (!namedExportsMode) {
					return `${varOrConst} ${name} = { default: require('${id}') };`;
				}

				if (!interop || isChunk || !exportsDefault) {
					return `${varOrConst} ${name} = require('${id}');`;
				}

				needsInterop = true;

				if (exportsNames) {
					return (
						`${varOrConst} ${name} = require('${id}');` +
						`\n${varOrConst} ${name}__default = _interopDefault(${name});`
					);
				}

				return `${varOrConst} ${name} = _interopDefault(require('${id}'));`;
			}
		)
		.join('\n');

	if (needsInterop) {
		intro += `function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n`;
	}

	if (importBlock) {
		intro += importBlock + '\n\n';
	}

	const exportBlock = getExportBlock(
		exports,
		dependencies,
		namedExportsMode,
		options.interop,
		'module.exports ='
	);

	magicString.prepend(intro);

	if (exportBlock) magicString.append('\n\n' + exportBlock);
	if (outro) magicString.append(outro);

	return magicString;
}
