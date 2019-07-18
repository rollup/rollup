import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/types';
import { INTEROP_NAMESPACE_VARIABLE } from '../utils/variableNames';
import { FinaliserOptions } from './index';
import { compactEsModuleExport, esModuleExport } from './shared/esModuleExport';
import getExportBlock from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
import { getInteropNamespace } from './shared/getInteropNamespace';
import warnOnBuiltins from './shared/warnOnBuiltins';

// AMD resolution will only respect the AMD baseUrl if the .js extension is omitted.
// The assumption is that this makes sense for all relative ids:
// https://requirejs.org/docs/api.html#jsfiles
function removeExtensionFromRelativeAmdId(id: string) {
	if (id[0] === '.' && id.endsWith('.js')) {
		return id.slice(0, -3);
	}
	return id;
}

export default function amd(
	magicString: MagicStringBundle,
	{
		accessedGlobals,
		dependencies,
		exports,
		hasExports,
		indentString: t,
		intro,
		isEntryModuleFacade,
		namedExportsMode,
		outro,
		varOrConst,
		warn
	}: FinaliserOptions,
	options: OutputOptions
) {
	warnOnBuiltins(warn, dependencies);

	const deps = dependencies.map(m => `'${removeExtensionFromRelativeAmdId(m.id)}'`);
	const args = dependencies.map(m => m.name);
	const n = options.compact ? '' : '\n';
	const _ = options.compact ? '' : ' ';

	if (namedExportsMode && hasExports) {
		args.unshift(`exports`);
		deps.unshift(`'exports'`);
	}

	if (accessedGlobals.has('require')) {
		args.unshift('require');
		deps.unshift(`'require'`);
	}

	if (accessedGlobals.has('module')) {
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
	if (interopBlock) {
		magicString.prepend(interopBlock + n + n);
	}
	if (accessedGlobals.has(INTEROP_NAMESPACE_VARIABLE)) {
		magicString.prepend(getInteropNamespace(_, n, t));
	}

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(
		exports,
		dependencies,
		namedExportsMode,
		options.interop as boolean,
		options.compact as boolean,
		t
	);
	if (exportBlock) magicString.append(n + n + exportBlock);
	if (namedExportsMode && hasExports && isEntryModuleFacade && options.esModule)
		magicString.append(`${n}${n}${options.compact ? compactEsModuleExport : esModuleExport}`);
	if (outro) magicString.append(outro);

	return magicString
		.indent(t)
		.append(n + n + '});')
		.prepend(wrapperStart);
}
