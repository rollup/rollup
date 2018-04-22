import error from '../utils/error';
import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';
import { esModuleExport, compactEsModuleExport } from './shared/esModuleExport';
import { property, keypath } from './shared/sanitize';
import warnOnBuiltins from './shared/warnOnBuiltins';
import trimEmptyImports from './shared/trimEmptyImports';
import setupNamespace from './shared/setupNamespace';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/types';
import { FinaliserOptions } from './index';

function globalProp(name: string) {
	if (!name) return 'null';
	return `global${keypath(name)}`;
}

function safeAccess(name: string, compact: boolean) {
	const parts = name.split('.');

	let acc = 'global';
	return parts.map(part => ((acc += property(part)), acc)).join(compact ? '&&' : ` && `);
}

export default function umd(
	magicString: MagicStringBundle,
	{ graph, namedExportsMode, hasExports, indentString: t, intro, outro, dependencies, exports }: FinaliserOptions,
	options: OutputOptions
) {
	const _ = options.compact ? '' : ' ';
	const nl = options.compact ? '' : '\n';

	const wrapperOutro = nl + nl + '})));';

	if (hasExports && !options.name) {
		error({
			code: 'INVALID_OPTION',
			message: 'You must supply output.name for UMD bundles'
		});
	}

	warnOnBuiltins(graph, dependencies);

	const amdDeps = dependencies.map(m => `'${m.id}'`);
	const cjsDeps = dependencies.map(m => `require('${m.id}')`);

	const trimmed = trimEmptyImports(dependencies);
	const globalDeps = trimmed.map(module => globalProp(module.globalName));
	const args = trimmed.map(m => m.name);

	if (namedExportsMode && hasExports) {
		amdDeps.unshift(`'exports'`);
		cjsDeps.unshift(`exports`);
		globalDeps.unshift(
			`(${setupNamespace(options.name, 'global', true, options.globals, options.compact)}${_}=${_}${
				options.extend ? `${globalProp(options.name)}${_}||${_}` : ''
			}{})`
		);

		args.unshift('exports');
	}

	const amdOptions = options.amd || {};

	const amdParams =
		(amdOptions.id ? `'${amdOptions.id}',${_}` : ``) +
		(amdDeps.length ? `[${amdDeps.join(`,${_}`)}],${_}` : ``);

	const define = amdOptions.define || 'define';

	const cjsExport = !namedExportsMode && hasExports ? `module.exports${_}=${_}` : ``;
	const defaultExport =
		!namedExportsMode && hasExports
			? `${setupNamespace(options.name, 'global', true, options.globals, options.compact)}${_}=${_}`
			: '';

	const useStrict = options.strict !== false ? `${_}'use strict';${nl}` : ``;

	let globalExport;

	if (options.noConflict === true) {
		let factory;

	if (!namedExportsMode && hasExports) {
			factory = `var exports${_}=${_}factory(${globalDeps});`;
		} else if (namedExportsMode) {
			const module = globalDeps.shift();
			factory = `var exports${_}=${_}${module};${nl}`;
			factory += `${t}${t}factory(${['exports'].concat(globalDeps)});`;
		}
		globalExport = `(function()${_}{${nl}`;
		globalExport += `${t}${t}var current${_}=${_}${safeAccess(
			options.name,
			options.compact
		)};${nl}`;
		globalExport += `${t}${t}${factory}${nl}`;
		globalExport += `${t}${t}${globalProp(options.name)}${_}=${_}exports;${nl}`;
		globalExport += `${t}${t}exports.noConflict${_}=${_}function()${_}{${_}`;
		globalExport += `${globalProp(options.name)}${_}=${_}current;${_}return exports${
			options.compact ? '' : '; '
		}};${nl}`;
		globalExport += `${t}})()`;
	} else {
		globalExport = `(${defaultExport}factory(${globalDeps}))`;
	}

	let wrapperIntro = `(function${_}(global,${_}factory)${_}{${nl}`;
	wrapperIntro += `${t}typeof exports${_}===${_}'object'${_}&&${_}typeof module${_}!==${_}'undefined'${_}?`;
	wrapperIntro += `${_}${cjsExport}factory(${cjsDeps.join(`,${_}`)})${_}:${nl}`;
	wrapperIntro += `${t}typeof ${define}${_}===${_}'function'${_}&&${_}${define}.amd${_}?${_}${define}(${amdParams}factory)${_}:${nl}`;
	wrapperIntro += `${t}${globalExport};${nl}`;
	wrapperIntro += `}(this,${_}(function${_}(${args})${_}{${useStrict}${nl}`;

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(dependencies, options, graph.varOrConst);
	if (interopBlock) magicString.prepend(interopBlock + nl + nl);

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(exports, dependencies, namedExportsMode, options.interop, options.compact);
	if (exportBlock) magicString.append(nl + nl + exportBlock);
	if (namedExportsMode && hasExports && options.legacy !== true)
		magicString.append(nl + nl + (options.compact ? compactEsModuleExport : esModuleExport));
	if (outro) magicString.append(outro);

	return magicString
		.trim()
		.indent(t)
		.append(wrapperOutro)
		.prepend(wrapperIntro);
}
