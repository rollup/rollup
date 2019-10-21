import { Bundle as MagicStringBundle } from 'magic-string';
import { GlobalsOption, OutputOptions } from '../rollup/types';
import { error } from '../utils/error';
import { isLegal } from '../utils/identifierHelpers';
import { FinaliserOptions } from './index';
import getExportBlock from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
import { keypath } from './shared/sanitize';
import setupNamespace from './shared/setupNamespace';
import trimEmptyImports from './shared/trimEmptyImports';
import warnOnBuiltins from './shared/warnOnBuiltins';

const thisProp = (name: string) => `this${keypath(name)}`;

export default function iife(
	magicString: MagicStringBundle,
	{
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
	options: OutputOptions
) {
	const _ = options.compact ? '' : ' ';
	const n = options.compact ? '' : '\n';

	const { extend, name } = options;
	const isNamespaced = name && name.indexOf('.') !== -1;
	const useVariableAssignment = !extend && !isNamespaced;

	if (name && useVariableAssignment && !isLegal(name)) {
		error({
			code: 'ILLEGAL_IDENTIFIER_AS_NAME',
			message: `Given name (${name}) is not legal JS identifier. If you need this you can try --extend option`
		});
	}

	warnOnBuiltins(warn, dependencies);

	const external = trimEmptyImports(dependencies);
	const deps = external.map(dep => dep.globalName || 'null');
	const args = external.map(m => m.name);

	if (hasExports && !name) {
		warn({
			message: `If you do not supply "output.name", you may not be able to access the exports of an IIFE bundle.`
		});
	}

	if (namedExportsMode && hasExports) {
		if (extend) {
			deps.unshift(`${thisProp(name as string)}${_}=${_}${thisProp(name as string)}${_}||${_}{}`);
			args.unshift('exports');
		} else {
			deps.unshift('{}');
			args.unshift('exports');
		}
	}

	const useStrict = options.strict !== false ? `${t}'use strict';${n}${n}` : ``;

	let wrapperIntro = `(function${_}(${args.join(`,${_}`)})${_}{${n}${useStrict}`;

	if (hasExports && (!extend || !namedExportsMode) && name) {
		wrapperIntro =
			(useVariableAssignment ? `${varOrConst} ${name}` : thisProp(name)) +
			`${_}=${_}${wrapperIntro}`;
	}

	if (isNamespaced && hasExports) {
		wrapperIntro =
			setupNamespace(
				name as string,
				'this',
				options.globals as GlobalsOption,
				options.compact as boolean
			) + wrapperIntro;
	}

	let wrapperOutro = `${n}${n}}(${deps.join(`,${_}`)}));`;

	if (!extend && namedExportsMode && hasExports) {
		wrapperOutro = `${n}${n}${t}return exports;${wrapperOutro}`;
	}

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(dependencies, options, varOrConst);
	if (interopBlock) magicString.prepend(interopBlock + n + n);

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
	if (outro) magicString.append(outro);

	return magicString
		.indent(t)
		.prepend(wrapperIntro)
		.append(wrapperOutro);
}
