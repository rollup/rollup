import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';
import esModuleExport from './shared/esModuleExport';
import warnOnBuiltins from './shared/warnOnBuiltins';
import Chunk, { ChunkDependencies, ChunkExports } from '../Chunk';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/index';

export default function amd(
	chunk: Chunk,
	magicString: MagicStringBundle,
	{
		exportMode,
		indentString,
		intro,
		outro,
		dynamicImport,
		dependencies,
		exports
	}: {
		exportMode: string;
		indentString: string;
		intro: string;
		outro: string;
		dynamicImport: boolean;
		dependencies: ChunkDependencies;
		exports: ChunkExports;
	},
	options: OutputOptions
) {
	warnOnBuiltins(chunk);

	const deps = dependencies.map(m => `'${m.id}'`);
	const args = dependencies.map(m => m.name);

	if (exportMode === 'named') {
		args.unshift(`exports`);
		deps.unshift(`'exports'`);
	}

	if (dynamicImport) {
		args.unshift('require');
		deps.unshift(`'require'`);
	}

	const amdOptions = options.amd || {};

	const params =
		(amdOptions.id ? `'${amdOptions.id}', ` : ``) + (deps.length ? `[${deps.join(', ')}], ` : ``);

	const useStrict = options.strict !== false ? ` 'use strict';` : ``;
	const define = amdOptions.define || 'define';
	const wrapperStart = `${define}(${params}function (${args.join(', ')}) {${useStrict}\n\n`;

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(dependencies, options, chunk.graph.varOrConst);
	if (interopBlock) magicString.prepend(interopBlock + '\n\n');

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(exports, dependencies, exportMode);
	if (exportBlock) magicString.append('\n\n' + exportBlock);
	if (exportMode === 'named' && options.legacy !== true && chunk.isEntryModuleFacade)
		magicString.append(`\n\n${esModuleExport}`);
	if (outro) magicString.append(outro);

	return magicString
		.indent(indentString)
		.append('\n\n});')
		.prepend(wrapperStart);
}
