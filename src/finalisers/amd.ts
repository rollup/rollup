import { Bundle as MagicStringBundle } from 'magic-string';
import { NormalizedOutputOptions } from '../rollup/types';
import { FinaliserOptions } from './index';
import getCompleteAmdId from './shared/getCompleteAmdId';
import { getExportBlock, getNamespaceMarkers } from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
import removeExtensionFromRelativeAmdId from './shared/removeExtensionFromRelativeAmdId';
import warnOnBuiltins from './shared/warnOnBuiltins';

export default function amd(
	magicString: MagicStringBundle,
	{
		accessedGlobals,
		dependencies,
		exports,
		hasExports,
		id,
		indentString: t,
		intro,
		isEntryFacade,
		isModuleFacade,
		namedExportsMode,
		outro,
		varOrConst,
		warn
	}: FinaliserOptions,
	{
		amd,
		compact,
		esModule,
		externalLiveBindings,
		freeze,
		interop,
		namespaceToStringTag,
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

	const completeAmdId = getCompleteAmdId(amd, id);
	const params =
		(completeAmdId ? `'${completeAmdId}',${_}` : ``) +
		(deps.length ? `[${deps.join(`,${_}`)}],${_}` : ``);
	const useStrict = strict ? `${_}'use strict';` : '';

	magicString.prepend(
		`${intro}${getInteropBlock(
			dependencies,
			varOrConst,
			interop,
			externalLiveBindings,
			freeze,
			namespaceToStringTag,
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
	let namespaceMarkers = getNamespaceMarkers(
		namedExportsMode && hasExports,
		isEntryFacade && esModule,
		isModuleFacade && namespaceToStringTag,
		_,
		n
	);
	if (namespaceMarkers) {
		namespaceMarkers = n + n + namespaceMarkers;
	}
	magicString.append(`${exportBlock}${namespaceMarkers}${outro}`);
	return magicString
		.indent(t)
		.prepend(`${amd.define}(${params}function${_}(${args.join(`,${_}`)})${_}{${useStrict}${n}${n}`)
		.append(`${n}${n}});`);
}
