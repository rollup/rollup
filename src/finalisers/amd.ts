import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';
import esModuleExport from './shared/esModuleExport';
import warnOnBuiltins from './shared/warnOnBuiltins';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/index';
import { FinaliserOptions } from './index';

export default function amd(
	magicString: MagicStringBundle,
	{
		graph,
		exportMode,
		indentString,
		intro,
		outro,
		dynamicImport,
		dependencies,
		exports,
		isEntryModuleFacade
	}: FinaliserOptions,
	options: OutputOptions
) {
	warnOnBuiltins(graph, dependencies);

	const deps = dependencies.map(m => `'${m.id}'`);
	const args = dependencies.map(m => m.name);

	if (exportMode === 'named') {
		args.unshift(`exports`);
		deps.unshift(`'exports'`);
	}

	if (dynamicImport) {
		args.unshift('require');
		deps.unshift(`'require'`);
	}

	const amdOptions = options.amd || {};

	const params =
		(amdOptions.id ? `'${amdOptions.id}', ` : ``) + (deps.length ? `[${deps.join(', ')}], ` : ``);

	const useStrict = options.strict !== false ? ` 'use strict';` : ``;
	const define = amdOptions.define || 'define';
	const wrapperStart = `${define}(${params}function (${args.join(', ')}) {${useStrict}\n\n`;

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(dependencies, options, graph.varOrConst);
	if (interopBlock) magicString.prepend(interopBlock + '\n\n');

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(exports, dependencies, exportMode);
	if (exportBlock) magicString.append('\n\n' + exportBlock);
	if (exportMode === 'named' && options.legacy !== true && isEntryModuleFacade)
		magicString.append(`\n\n${esModuleExport}`);
	if (outro) magicString.append(outro);

	return magicString
		.indent(indentString)
		.append('\n\n});')
		.prepend(wrapperStart);
}
