import error from '../utils/error';
import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';
import { keypath } from './shared/sanitize';
import warnOnBuiltins from './shared/warnOnBuiltins';
import trimEmptyImports from './shared/trimEmptyImports';
import setupNamespace from './shared/setupNamespace';
import { isLegal } from '../utils/identifierHelpers';
import Chunk, { ChunkDependencies, ChunkExports } from '../Chunk';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/index';

const thisProp = (name: string) => `this${keypath(name)}`;

export default function iife(
	chunk: Chunk,
	magicString: MagicStringBundle,
	{
		exportMode,
		indentString,
		intro,
		outro,
		dependencies,
		exports
	}: {
		exportMode: string;
		indentString: string;
		intro: string;
		outro: string;
		dependencies: ChunkDependencies;
		exports: ChunkExports;
	},
	options: OutputOptions
) {
	const { extend, name } = options;
	const isNamespaced = name && name.indexOf('.') !== -1;
	const possibleVariableAssignment = !extend && !isNamespaced;

	if (name && possibleVariableAssignment && !isLegal(name)) {
		error({
			code: 'ILLEGAL_IDENTIFIER_AS_NAME',
			message: `Given name (${name}) is not legal JS identifier. If you need this you can try --extend option`
		});
	}

	warnOnBuiltins(chunk);

	const external = trimEmptyImports(dependencies);
	const deps = external.map(dep => dep.globalName || 'null');
	const args = external.map(m => m.name);

	if (exportMode !== 'none' && !name) {
		error({
			code: 'INVALID_OPTION',
			message: `You must supply output.name for IIFE bundles`
		});
	}

	if (extend) {
		deps.unshift(`(${thisProp(name)} = ${thisProp(name)} || {})`);
		args.unshift('exports');
	} else if (exportMode === 'named') {
		deps.unshift('{}');
		args.unshift('exports');
	}

	const useStrict = options.strict !== false ? `${indentString}'use strict';\n\n` : ``;

	let wrapperIntro = `(function (${args}) {\n${useStrict}`;

	if (exportMode !== 'none' && !extend) {
		wrapperIntro =
			(isNamespaced ? thisProp(name) : `${chunk.graph.varOrConst} ${name}`) + ` = ${wrapperIntro}`;
	}

	if (isNamespaced) {
		wrapperIntro = setupNamespace(name, 'this', false, options.globals) + wrapperIntro;
	}

	let wrapperOutro = `\n\n}(${deps}));`;

	if (!extend && exportMode === 'named') {
		wrapperOutro = `\n\n${indentString}return exports;${wrapperOutro}`;
	}

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(dependencies, options, chunk.graph.varOrConst);
	if (interopBlock) magicString.prepend(interopBlock + '\n\n');

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(exports, dependencies, exportMode);
	if (exportBlock) magicString.append('\n\n' + exportBlock);
	if (outro) magicString.append(outro);

	return magicString
		.indent(indentString)
		.prepend(wrapperIntro)
		.append(wrapperOutro);
}
