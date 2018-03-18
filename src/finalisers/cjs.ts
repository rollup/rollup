import esModuleExport from './shared/esModuleExport';
import { OutputOptions } from '../rollup/index';
import { Bundle as MagicStringBundle } from 'magic-string';
import getExportBlock from './shared/getExportBlock';
import { FinaliserOptions } from './index';

export default function cjs(
	magicString: MagicStringBundle,
	{ graph, isEntryModuleFacade, exportMode, intro, outro, dependencies, exports }: FinaliserOptions,
	options: OutputOptions
) {
	intro =
		(options.strict === false ? intro : `'use strict';\n\n${intro}`) +
		(exportMode === 'named' && options.legacy !== true && isEntryModuleFacade
			? `${esModuleExport}\n\n`
			: '');

	let needsInterop = false;

	const varOrConst = graph.varOrConst;
	const interop = options.interop !== false;

	const importBlock = dependencies
		.map(({ id, isChunk, name, reexports, imports }) => {
			if (!reexports && !imports) {
				return `require('${id}');`;
			}

			if (!interop || isChunk) {
				return `${varOrConst} ${name} = require('${id}');`;
			}

			const usesDefault =
				(imports && imports.some(specifier => specifier.imported === 'default')) ||
				(reexports && reexports.some(specifier => specifier.imported === 'default'));
			if (!usesDefault) {
				return `${varOrConst} ${name} = require('${id}');`;
			}

			const exportsNamespace = imports && imports.some(specifier => specifier.imported === '*');
			if (exportsNamespace) {
				return (
					`${varOrConst} ${name} = require('${id}');` +
					`\n${varOrConst} ${name}__default = ${name}['default'];`
				);
			}

			needsInterop = true;

			const exportsNames =
				(imports &&
					imports.some(
						specifier => specifier.imported !== 'default' && specifier.imported !== '*'
					)) ||
				(reexports &&
					reexports.some(
						specifier => specifier.imported !== 'default' && specifier.imported !== '*'
					));
			if (exportsNames) {
				return (
					`${varOrConst} ${name} = require('${id}');` +
					`\n${varOrConst} ${name}__default = _interopDefault(${name});`
				);
			}

			return `${varOrConst} ${name} = _interopDefault(require('${id}'));`;
		})
		.join('\n');

	if (needsInterop) {
		intro += `function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n`;
	}

	if (importBlock) {
		intro += importBlock + '\n\n';
	}

	const exportBlock = getExportBlock(exports, dependencies, exportMode, 'module.exports =');

	magicString.prepend(intro);

	if (exportBlock) magicString.append('\n\n' + exportBlock);
	if (outro) magicString.append(outro);

	return magicString;
}
