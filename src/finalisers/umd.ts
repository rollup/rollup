import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/types';
import { error } from '../utils/error';
import { FinaliserOptions } from './index';
import { compactEsModuleExport, esModuleExport } from './shared/esModuleExport';
import getExportBlock from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
import { keypath, property } from './shared/sanitize';
import { assignToDeepVariable } from './shared/setupNamespace';
import trimEmptyImports from './shared/trimEmptyImports';
import warnOnBuiltins from './shared/warnOnBuiltins';

function globalProp(name: string, globalVar: string) {
	if (!name) return 'null';
	return `${globalVar}${keypath(name)}`;
}

function safeAccess(name: string, globalVar: string, _: string) {
	const parts = name.split('.');

	let acc = globalVar;
	return parts.map(part => ((acc += property(part)), acc)).join(`${_}&&${_}`);
}

export default function umd(
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
	const factoryVar = options.compact ? 'f' : 'factory';
	const globalVar = options.compact ? 'g' : 'global';

	if (hasExports && !options.name) {
		error({
			code: 'INVALID_OPTION',
			message: 'You must supply "output.name" for UMD bundles.'
		});
	}

	warnOnBuiltins(warn, dependencies);

	const amdDeps = dependencies.map(m => `'${m.id}'`);
	const cjsDeps = dependencies.map(m => `require('${m.id}')`);

	const trimmedImports = trimEmptyImports(dependencies);
	const globalDeps = trimmedImports.map(module => globalProp(module.globalName, globalVar));
	const factoryArgs = trimmedImports.map(m => m.name);

	if (namedExportsMode && (hasExports || options.noConflict === true)) {
		amdDeps.unshift(`'exports'`);
		cjsDeps.unshift(`exports`);
		globalDeps.unshift(
			assignToDeepVariable(
				options.name,
				globalVar,
				options.globals,
				options.compact,
				`${options.extend ? `${globalProp(options.name, globalVar)}${_}||${_}` : ''}{}`
			)
		);

		factoryArgs.unshift('exports');
	}

	const amdOptions = options.amd || {};

	const amdParams =
		(amdOptions.id ? `'${amdOptions.id}',${_}` : ``) +
		(amdDeps.length ? `[${amdDeps.join(`,${_}`)}],${_}` : ``);

	const define = amdOptions.define || 'define';
	const cjsExport = !namedExportsMode && hasExports ? `module.exports${_}=${_}` : ``;
	const useStrict = options.strict !== false ? `${_}'use strict';${n}` : ``;

	let iifeExport;

	if (options.noConflict === true) {
		const noConflictExportsVar = options.compact ? 'e' : 'exports';
		let factory;

		if (!namedExportsMode && hasExports) {
			factory = `var ${noConflictExportsVar}${_}=${_}${assignToDeepVariable(
				options.name,
				globalVar,
				options.globals,
				options.compact,
				`${factoryVar}(${globalDeps.join(`,${_}`)})`
			)};`;
		} else if (namedExportsMode) {
			const module = globalDeps.shift();
			factory =
				`var ${noConflictExportsVar}${_}=${_}${module};${n}` +
				`${t}${t}${factoryVar}(${[noConflictExportsVar].concat(globalDeps).join(`,${_}`)});`;
		}
		iifeExport =
			`(function${_}()${_}{${n}` +
			`${t}${t}var current${_}=${_}${safeAccess(options.name, globalVar, _)};${n}` +
			`${t}${t}${factory}${n}` +
			`${t}${t}${noConflictExportsVar}.noConflict${_}=${_}function${_}()${_}{${_}` +
			`${globalProp(options.name, globalVar)}${_}=${_}current;${_}return ${noConflictExportsVar}${
				options.compact ? '' : '; '
			}};${n}` +
			`${t}}())`;
	} else {
		iifeExport = `${factoryVar}(${globalDeps.join(`,${_}`)})`;
		if (!namedExportsMode && hasExports) {
			iifeExport = assignToDeepVariable(
				options.name,
				globalVar,
				options.globals,
				options.compact,
				iifeExport
			);
		}
	}

	const iifeNeedsGlobal =
		hasExports || (options.noConflict === true && namedExportsMode) || globalDeps.length > 0;
	const globalParam = iifeNeedsGlobal ? `${globalVar},${_}` : '';
	const globalArg = iifeNeedsGlobal ? `this,${_}` : '';
	const iifeStart = iifeNeedsGlobal ? `(${globalVar}${_}=${_}${globalVar}${_}||${_}self,${_}` : '';
	const iifeEnd = iifeNeedsGlobal ? ')' : '';
	const cjsIntro = iifeNeedsGlobal
		? `${t}typeof exports${_}===${_}'object'${_}&&${_}typeof module${_}!==${_}'undefined'${_}?` +
		  `${_}${cjsExport}${factoryVar}(${cjsDeps.join(`,${_}`)})${_}:${n}`
		: '';

	const wrapperIntro =
		`(function${_}(${globalParam}${factoryVar})${_}{${n}` +
		cjsIntro +
		`${t}typeof ${define}${_}===${_}'function'${_}&&${_}${define}.amd${_}?${_}${define}(${amdParams}${factoryVar})${_}:${n}` +
		`${t}${iifeStart}${iifeExport}${iifeEnd};${n}` +
		`}(${globalArg}function${_}(${factoryArgs.join(', ')})${_}{${useStrict}${n}`;

	const wrapperOutro = n + n + '}));';

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock(dependencies, options, varOrConst);
	if (interopBlock) magicString.prepend(interopBlock + n + n);

	if (intro) magicString.prepend(intro);

	const exportBlock = getExportBlock(
		exports,
		dependencies,
		namedExportsMode,
		options.interop,
		options.compact
	);
	if (exportBlock) magicString.append(n + n + exportBlock);
	if (namedExportsMode && hasExports && options.esModule)
		magicString.append(n + n + (options.compact ? compactEsModuleExport : esModuleExport));
	if (outro) magicString.append(outro);

	return magicString
		.trim()
		.indent(t)
		.append(wrapperOutro)
		.prepend(wrapperIntro);
}
