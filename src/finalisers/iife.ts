import { Bundle as MagicStringBundle } from 'magic-string';
import { NormalizedOutputOptions } from '../rollup/types';
import { error } from '../utils/error';
import { isLegal } from '../utils/identifierHelpers';
import { FinaliserOptions } from './index';
import { getExportBlock, getNamespaceMarkers } from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
import { keypath } from './shared/sanitize';
import setupNamespace from './shared/setupNamespace';
import trimEmptyImports from './shared/trimEmptyImports';
import warnOnBuiltins from './shared/warnOnBuiltins';

const thisProp = (name: string) => `this${keypath(name)}`;

export default function iife(
	magicString: MagicStringBundle,
	{
		accessedGlobals,
		dependencies,
		exports,
		hasExports,
		indentString: t,
		intro,
		namedExportsMode,
		outro,
		varOrConst,
		warn
	}: FinaliserOptions,
	{
		compact,
		esModule,
		extend,
		freeze,
		externalLiveBindings,
		globals,
		interop,
		name,
		namespaceToStringTag,
		strict
	}: NormalizedOutputOptions
) {
	const _ = compact ? '' : ' ';
	const s = compact ? '' : ';';
	const n = compact ? '' : '\n';

	const isNamespaced = name && name.indexOf('.') !== -1;
	const useVariableAssignment = !extend && !isNamespaced;

	if (name && useVariableAssignment && !isLegal(name)) {
		return error({
			code: 'ILLEGAL_IDENTIFIER_AS_NAME',
			message: `Given name "${name}" is not a legal JS identifier. If you need this, you can try "output.extend: true".`
		});
	}

	warnOnBuiltins(warn, dependencies);

	const external = trimEmptyImports(dependencies);
	const deps = external.map(dep => dep.globalName || 'null');
	const args = external.map(m => m.name);

	if (hasExports && !name) {
		warn({
			code: 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT',
			message: `If you do not supply "output.name", you may not be able to access the exports of an IIFE bundle.`
		});
	}

	if (namedExportsMode && hasExports) {
		if (extend) {
			deps.unshift(`${thisProp(name!)}${_}=${_}${thisProp(name!)}${_}||${_}{}`);
			args.unshift('exports');
		} else {
			deps.unshift('{}');
			args.unshift('exports');
		}
	}

	const useStrict = strict ? `${t}'use strict';${n}` : '';
	const interopBlock = getInteropBlock(
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
	);
	magicString.prepend(`${intro}${interopBlock}`);

	let wrapperIntro = `(function${_}(${args.join(`,${_}`)})${_}{${n}${useStrict}${n}`;
	if (hasExports) {
		if (name && !(extend && namedExportsMode)) {
			wrapperIntro =
				(useVariableAssignment ? `${varOrConst} ${name}` : thisProp(name)) +
				`${_}=${_}${wrapperIntro}`;
		}
		if (isNamespaced) {
			wrapperIntro = setupNamespace(name!, 'this', globals, compact) + wrapperIntro;
		}
	}

	let wrapperOutro = `${n}${n}}(${deps.join(`,${_}`)}));`;
	if (hasExports && !extend && namedExportsMode) {
		wrapperOutro = `${n}${n}${t}return exports;${wrapperOutro}`;
	}

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
		esModule,
		namespaceToStringTag,
		_,
		n
	);
	if (namespaceMarkers) {
		namespaceMarkers = n + n + namespaceMarkers;
	}
	magicString.append(`${exportBlock}${namespaceMarkers}${outro}`);
	return magicString.indent(t).prepend(wrapperIntro).append(wrapperOutro);
}
