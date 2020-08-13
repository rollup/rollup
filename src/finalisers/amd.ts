import { Bundle as MagicStringBundle } from 'magic-string';
import { NormalizedOutputOptions } from '../rollup/types';
import { FinaliserOptions } from './index';
import { compactEsModuleExport, esModuleExport } from './shared/esModuleExport';
import getExportBlock from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
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
	{
		amd: { define: amdDefine, id: amdId },
		compact,
		esModule,
		externalLiveBindings,
		freeze,
		interop,
		strict
	}: NormalizedOutputOptions
) {
	warnOnBuiltins(warn, dependencies);
	const deps = dependencies.map(m => `'${removeExtensionFromRelativeAmdId(m.id)}'`);
	const args = dependencies.map(m => m.name);
	const n = compact ? '' : '\n';
	const s = compact ? '' : ';';
	const _ = compact ? '' : ' ';

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

	const params =
		(amdId ? `'${amdId}',${_}` : ``) + (deps.length ? `[${deps.join(`,${_}`)}],${_}` : ``);
	const useStrict = strict ? `${_}'use strict';` : '';

	magicString.prepend(
		`${intro}${getInteropBlock(
			dependencies,
			varOrConst,
			interop,
			externalLiveBindings,
			freeze,
			accessedGlobals,
			_,
			n,
			s,
			t
		)}`
	);

	const exportBlock = getExportBlock(
		exports,
		dependencies,
		namedExportsMode,
		interop,
		compact,
		t,
		externalLiveBindings
	);
	if (exportBlock) magicString.append(exportBlock);
	if (namedExportsMode && hasExports && isEntryModuleFacade && esModule)
		magicString.append(`${n}${n}${compact ? compactEsModuleExport : esModuleExport}`);
	if (outro) magicString.append(outro);

	return magicString
		.indent(t)
		.prepend(`${amdDefine}(${params}function${_}(${args.join(`,${_}`)})${_}{${useStrict}${n}${n}`)
		.append(`${n}${n}});`);
}
