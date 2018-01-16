import { blank } from '../utils/object';
import error from '../utils/error';
import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';
import getGlobalNameMaker from './shared/getGlobalNameMaker';
import { keypath } from './shared/sanitize';
import warnOnBuiltins from './shared/warnOnBuiltins';
import trimEmptyImports from './shared/trimEmptyImports';
import setupNamespace from './shared/setupNamespace';
import { isLegal } from '../utils/identifierHelpers';
import Chunk from '../Chunk';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/index';
import ExternalModule from '../ExternalModule';

const thisProp = (name: string) => `this${keypath(name)}`;

export default function iife (
	chunk: Chunk,
	magicString: MagicStringBundle,
	{ exportMode, indentString, intro, outro }: {
		exportMode: string;
		indentString: string;
		getPath: (name: string) => string;
		intro: string;
		outro: string
	},
	options: OutputOptions
) {
	const globalNameMaker = getGlobalNameMaker(
		options.globals || blank(),
		chunk,
		'null'
	);

	const { extend, name } = options;
	const isNamespaced = name && name.indexOf('.') !== -1;
	const possibleVariableAssignment = !extend && !isNamespaced;

	const moduleDeclarations = chunk.getModuleDeclarations();

	if (name && possibleVariableAssignment && !isLegal(name)) {
		error({
			code: 'ILLEGAL_IDENTIFIER_AS_NAME',
			message: `Given name (${name}) is not legal JS identifier. If you need this you can try --extend option`
		});
	}

	warnOnBuiltins(chunk);

	const external = trimEmptyImports(chunk.externalModules);
	const dependencies = external.map(globalNameMaker);
	const args = (<ExternalModule[]>external).map(m => m.name);

	if (exportMode !== 'none' && !name) {
		error({
			code: 'INVALID_OPTION',
			message: `You must supply options.name for IIFE bundles`
		});
	}

	if (extend) {
		dependencies.unshift(`(${thisProp(name)} = ${thisProp(name)} || {})`);
		args.unshift('exports');
	} else if (exportMode === 'named') {
		dependencies.unshift('{}');
		args.unshift('exports');
	}

	const useStrict =
		options.strict !== false ? `${indentString}'use strict';\n\n` : ``;

	let wrapperIntro = `(function (${args}) {\n${useStrict}`;

	if (exportMode !== 'none' && !extend) {
		wrapperIntro =
			(isNamespaced ? thisProp(name) : `${chunk.graph.varOrConst} ${name}`) +
			` = ${wrapperIntro}`;
	}

	if (isNamespaced) {
		wrapperIntro =
			setupNamespace(name, 'this', false, options.globals) + wrapperIntro;
	}

	let wrapperOutro = `\n\n}(${dependencies}));`;

	if (!extend && exportMode === 'named') {
		wrapperOutro = `\n\n${indentString}return exports;${wrapperOutro}`;
	}

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(chunk, options);
	if (interopBlock) magicString.prepend(interopBlock + '\n\n');

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(moduleDeclarations.exports, moduleDeclarations.dependencies, exportMode);
	if (exportBlock) (<any> magicString).append('\n\n' + exportBlock); // TODO TypeScript: Awaiting PR
	if (outro) (<any> magicString).append(outro); // TODO TypeScript: Awaiting PR

	return (<any> magicString)
		.indent(indentString) // TODO TypeScript: Awaiting PR
		.prepend(wrapperIntro)
		.append(wrapperOutro);
}
