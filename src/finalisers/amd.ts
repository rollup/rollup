import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';
import { esModuleExport, compactEsModuleExport } from './shared/esModuleExport';
import warnOnBuiltins from './shared/warnOnBuiltins';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/types';
import { FinaliserOptions } from './index';

export default function amd(
	magicString: MagicStringBundle,
	{
		graph,
		namedExportsMode,
		hasExports,
		indentString,
		intro,
		outro,
		dynamicImport,
		importMeta,
		dependencies,
		exports,
		isEntryModuleFacade
	}: FinaliserOptions,
	options: OutputOptions
) {
	warnOnBuiltins(graph, dependencies);

	const deps = dependencies.map(m => `'${m.id}'`);
	const args = dependencies.map(m => m.name);
	const nl = options.compact ? '' : '\n';
	const _ = options.compact ? '' : ' ';

	if (namedExportsMode && hasExports) {
		args.unshift(`exports`);
		deps.unshift(`'exports'`);
	}

	if (dynamicImport) {
		args.unshift('require');
		deps.unshift(`'require'`);
	}

	if (importMeta) {
		args.unshift('module');
		deps.unshift(`'module'`);
	}

	const amdOptions = options.amd || {};

	const params =
		(amdOptions.id ? `'${amdOptions.id}',${_}` : ``) +
		(deps.length ? `[${deps.join(`,${_}`)}],${_}` : ``);

	const useStrict = options.strict !== false ? `${_}'use strict';` : ``;
	const define = amdOptions.define || 'define';
	const wrapperStart = `${define}(${params}function${_}(${args.join(
		`,${_}`
	)})${_}{${useStrict}${nl}${nl}`;

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(dependencies, options, graph.varOrConst);
	if (interopBlock) magicString.prepend(interopBlock + nl + nl);

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(exports, dependencies, namedExportsMode, options.interop, options.compact);
	if (exportBlock) magicString.append(nl + nl + exportBlock);
	if (namedExportsMode && hasExports && options.legacy !== true && isEntryModuleFacade)
		magicString.append(`${nl}${nl}${options.compact ? compactEsModuleExport : esModuleExport}`);
	if (outro) magicString.append(outro);

	return magicString
		.indent(indentString)
		.append(nl + nl + '});')
		.prepend(wrapperStart);
}
