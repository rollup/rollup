import esModuleExport from './shared/esModuleExport';
import { OutputOptions } from '../rollup/index';
import { Bundle as MagicStringBundle } from 'magic-string';
import Bundle from '../Bundle';
import getExportBlock from './shared/getExportBlock';

export default function cjs (
	bundle: Bundle,
	magicString: MagicStringBundle,
	{ exportMode, getPath, intro, outro }: {
		exportMode: string;
		indentString: string;
		getPath: (name: string) => string;
		intro: string;
		outro: string
	},
	options: OutputOptions
) {
	intro =
		(options.strict === false ? intro : `'use strict';\n\n${intro}`) +
		(exportMode === 'named' && options.legacy !== true && bundle.entryModuleFacade
			? `${esModuleExport}\n\n`
			: '');

	let needsInterop = false;

	const varOrConst = bundle.graph.varOrConst;
	const interop = options.interop !== false;

	const { dependencies, exports } = bundle.getModuleDeclarations();

	const importBlock = dependencies.map(({ id, isBundle, name, reexports, imports }) => {
		if (!reexports && !imports) {
			return `require('${getPath(id)}');`;
		}

		if (!interop || isBundle) {
			return `${varOrConst} ${name} = require('${getPath(id)}');`
		}

		const usesDefault = imports && imports.some(specifier => specifier.imported === 'default') ||
				reexports && reexports.some(specifier => specifier.imported === 'default');
		if (!usesDefault) {
			return `${varOrConst} ${name} = require('${getPath(id)}');`
		}

		const exportsNamespace = imports && imports.some(specifier => specifier.imported === '*');
		if (exportsNamespace) {
			return `${varOrConst} ${name} = require('${getPath(id)}');` +
					`\n${varOrConst} ${name}__default = ${name}['default'];`;
		}

		needsInterop = true;

		const exportsNames = imports && imports.some(specifier => specifier.imported !== 'default' && specifier.imported !== '*') ||
				reexports && reexports.some(specifier => specifier.imported === 'default');
		if (exportsNames) {
			return `${varOrConst} ${name} = require('${getPath(id)}');` +
					`\n${varOrConst} ${name}__default = _interopDefault(${name});`;
		}

		return `${varOrConst} ${name} = _interopDefault(require('${getPath(id)}'));`;
	}).join('\n');

	if (needsInterop) {
		intro += `function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n`;
	}

	if (importBlock) {
		intro += importBlock + '\n\n';
	}

	const exportBlock = getExportBlock(exports, dependencies, exportMode, 'module.exports =');

	magicString.prepend(intro);

	if (exportBlock) (<any> magicString).append('\n\n' + exportBlock); // TODO TypeScript: Awaiting PR
	if (outro) (<any> magicString).append(outro); // TODO TypeScript: Awaiting PR

	return magicString;
}
