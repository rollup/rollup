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

	const { dependencies, exports } = bundle.getModuleDeclarations();

	const deps = dependencies.map(m => `'${getPath(m.id)}'`);
	const args = dependencies.map(m => m.name);

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

	const exportBlock = getExportBlock(exports, dependencies, exportMode);
	if (exportBlock) (<any> magicString).append('\n\n' + exportBlock); // TODO TypeScript: Awaiting PR
	if (exportMode === 'named' && options.legacy !== true && bundle.entryModuleFacade)
		(<any> magicString).append(`\n\n${esModuleExport}`); // TODO TypeScript: Awaiting PR
	if (outro) (<any> magicString).append(outro);

	return (<any> magicString) // TODO TypeScript: Awaiting PR
		.indent(indentString)
		.append('\n\n});')
		.prepend(wrapperStart);
}
