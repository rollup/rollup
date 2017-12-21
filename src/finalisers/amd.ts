import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';
import esModuleExport from './shared/esModuleExport';
import warnOnBuiltins from './shared/warnOnBuiltins';
import Bundle from '../Bundle';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/index';

export default function amd (
	bundle: Bundle,
	magicString: MagicStringBundle,
	{ exportMode, getPath, indentString, intro, outro }: {
		exportMode: string;
		indentString: string;
		getPath: (name: string) => string;
		intro: string;
		outro: string
	},
	options: OutputOptions
) {
	warnOnBuiltins(bundle);
	const deps = bundle.externalModules.map(m => `'${getPath(m.id)}'`);
	const args = bundle.externalModules.map(m => m.name);

	if (exportMode === 'named') {
		args.unshift(`exports`);
		deps.unshift(`'exports'`);
	}

	const amdOptions = options.amd || {};

	const params =
		(amdOptions.id ? `'${amdOptions.id}', ` : ``) +
		(deps.length ? `[${deps.join(', ')}], ` : ``);

	const useStrict = options.strict !== false ? ` 'use strict';` : ``;
	const define = amdOptions.define || 'define';
	const wrapperStart = `${define}(${params}function (${args.join(
		', '
	)}) {${useStrict}\n\n`;

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(bundle, options);
	if (interopBlock) magicString.prepend(interopBlock + '\n\n');

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(bundle, exportMode);
	if (exportBlock) magicString.append('\n\n' + exportBlock);
	if (exportMode === 'named' && options.legacy !== true)
		magicString.append(`\n\n${esModuleExport}`);
	if (outro) magicString.append(outro);

	return magicString
		.indent(indentString)
		.append('\n\n});')
		.prepend(wrapperStart);
}
