import getExportBlock from './shared/getExportBlock';
import esModuleExport from './shared/esModuleExport';
import { OutputOptions } from '../rollup/index';
import { Bundle as MagicStringBundle } from 'magic-string';
import Bundle from '../Bundle';

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
		(exportMode === 'named' && options.legacy !== true
			? `${esModuleExport}\n\n`
			: '');

	let needsInterop = false;

	const varOrConst = bundle.varOrConst;
	const interop = options.interop !== false;

	// TODO handle empty imports, once they're supported
	const importBlock = bundle.externalModules
		.map(module => {
			if (interop && module.declarations.default) {
				if (module.exportsNamespace) {
					return (
						`${varOrConst} ${module.name} = require('${getPath(module.id)}');` +
						`\n${varOrConst} ${module.name}__default = ${
						module.name
						}['default'];`
					);
				}

				needsInterop = true;

				if (module.exportsNames) {
					return (
						`${varOrConst} ${module.name} = require('${getPath(module.id)}');` +
						`\n${varOrConst} ${module.name}__default = _interopDefault(${
						module.name
						});`
					);
				}

				return `${varOrConst} ${
					module.name
					} = _interopDefault(require('${getPath(module.id)}'));`;
			} else {
				const includedDeclarations = Object.keys(module.declarations).filter(
					name => module.declarations[name].included
				);

				const needsVar = includedDeclarations.length || module.reexported;

				return needsVar
					? `${varOrConst} ${module.name} = require('${getPath(module.id)}');`
					: `require('${getPath(module.id)}');`;
			}
		})
		.join('\n');

	if (needsInterop) {
		intro += `function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n`;
	}

	if (importBlock) {
		intro += importBlock + '\n\n';
	}

	magicString.prepend(intro);

	const exportBlock = getExportBlock(bundle, exportMode, 'module.exports =');
	if (exportBlock) (<any> magicString).append('\n\n' + exportBlock); // TODO TypeScript: Awaiting PR
	if (outro) (<any> magicString).append(outro); // TODO TypeScript: Awaiting PR

	return magicString;
}
