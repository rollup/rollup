import error from '../utils/error';
import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';
import { keypath } from './shared/sanitize';
import warnOnBuiltins from './shared/warnOnBuiltins';
import trimEmptyImports from './shared/trimEmptyImports';
import setupNamespace from './shared/setupNamespace';
import { isLegal } from '../utils/identifierHelpers';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/types';
import { FinaliserOptions } from './index';

const thisProp = (name: string) => `this${keypath(name)}`;

export default function iife(
	magicString: MagicStringBundle,
	{ graph, namedExportsMode, hasExports, indentString: t, intro, outro, dependencies, exports }: FinaliserOptions,
	options: OutputOptions
) {
	const _ = options.compact ? '' : ' ';
	const nl = options.compact ? '' : '\n';

	const { extend, name } = options;
	const isNamespaced = name && name.indexOf('.') !== -1;
	const possibleVariableAssignment = !extend && !isNamespaced;

	if (name && possibleVariableAssignment && !isLegal(name)) {
		error({
			code: 'ILLEGAL_IDENTIFIER_AS_NAME',
			message: `Given name (${name}) is not legal JS identifier. If you need this you can try --extend option`
		});
	}

	warnOnBuiltins(graph, dependencies);

	const external = trimEmptyImports(dependencies);
	const deps = external.map(dep => dep.globalName || 'null');
	const args = external.map(m => m.name);

	if (hasExports && !name) {
		error({
			code: 'INVALID_OPTION',
			message: `You must supply output.name for IIFE bundles`
		});
	}

	if (extend) {
		deps.unshift(`(${thisProp(name)}${_}=${_}${thisProp(name)}${_}||${_}{})`);
		args.unshift('exports');
	} else if (namedExportsMode && hasExports) {
		deps.unshift('{}');
		args.unshift('exports');
	}

	const useStrict = options.strict !== false ? `${t}'use strict';${nl}${nl}` : ``;

	let wrapperIntro = `(function${_}(${args})${_}{${nl}${useStrict}`;

	if (hasExports && !extend) {
		wrapperIntro =
			(isNamespaced ? thisProp(name) : `${graph.varOrConst} ${name}`) + `${_}=${_}${wrapperIntro}`;
	}

	if (isNamespaced) {
		wrapperIntro =
			setupNamespace(name, 'this', false, options.globals, options.compact) + wrapperIntro;
	}

	let wrapperOutro = `${nl}${nl}}(${deps}));`;

	if (!extend && namedExportsMode && hasExports) {
		wrapperOutro = `${nl}${nl}${t}return exports;${wrapperOutro}`;
	}

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(dependencies, options, graph.varOrConst);
	if (interopBlock) magicString.prepend(interopBlock + nl + nl);

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(exports, dependencies, namedExportsMode, options.interop, options.compact);
	if (exportBlock) magicString.append(nl + nl + exportBlock);
	if (outro) magicString.append(outro);

	return magicString
		.indent(t)
		.prepend(wrapperIntro)
		.append(wrapperOutro);
}
