import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/types';
import { FinaliserOptions } from './index';
import { compactEsModuleExport, esModuleExport } from './shared/esModuleExport';
import getExportBlock from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
import warnOnBuiltins from './shared/warnOnBuiltins';

export default function amd(
	magicString: MagicStringBundle,
	{
		dependencies,
		dynamicImport,
		exports,
		hasExports,
		indentString,
		intro,
		isEntryModuleFacade,
		namedExportsMode,
		needsAmdModule,
		outro,
		varOrConst,
		warn
	}: FinaliserOptions,
	options: OutputOptions
) {
	warnOnBuiltins(warn, dependencies);

	const deps = dependencies.map(m => `'${m.id}'`);
	const args = dependencies.map(m => m.name);
	const n = options.compact ? '' : '\n';
	const _ = options.compact ? '' : ' ';

	if (namedExportsMode && hasExports) {
		args.unshift(`exports`);
		deps.unshift(`'exports'`);
	}

	if (dynamicImport) {
		args.unshift('require');
		deps.unshift(`'require'`);
	}

	if (needsAmdModule) {
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
	)})${_}{${useStrict}${n}${n}`;

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(dependencies, options, varOrConst);
	if (interopBlock) magicString.prepend(interopBlock + n + n);

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(
		exports,
		dependencies,
		namedExportsMode,
		options.interop,
		options.compact
	);
	if (exportBlock) magicString.append(n + n + exportBlock);
	if (namedExportsMode && hasExports && isEntryModuleFacade && options.esModule)
		magicString.append(`${n}${n}${options.compact ? compactEsModuleExport : esModuleExport}`);
	if (outro) magicString.append(outro);

	return magicString
		.indent(indentString)
		.append(n + n + '});')
		.prepend(wrapperStart);
}
