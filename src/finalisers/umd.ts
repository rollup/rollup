import { Bundle as MagicStringBundle } from 'magic-string';
import { NormalizedOutputOptions } from '../rollup/types';
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
	return parts.map(part => (acc += property(part))).join(`${_}&&${_}`);
}

export default function umd(
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
		amd: { define: amdDefine, id: amdId },
		compact,
		esModule,
		extend,
		externalLiveBindings,
		freeze,
		interop,
		name,
		globals,
		noConflict,
		strict
	}: NormalizedOutputOptions
) {
	const _ = compact ? '' : ' ';
	const n = compact ? '' : '\n';
	const s = compact ? '' : ';';
	const factoryVar = compact ? 'f' : 'factory';
	const globalVar = compact ? 'g' : 'global';

	if (hasExports && !name) {
		return error({
			code: 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT',
			message:
				'You must supply "output.name" for UMD bundles that have exports so that the exports are accessible in environments without a module loader.'
		});
	}

	warnOnBuiltins(warn, dependencies);

	const amdDeps = dependencies.map(m => `'${m.id}'`);
	const cjsDeps = dependencies.map(m => `require('${m.id}')`);

	const trimmedImports = trimEmptyImports(dependencies);
	const globalDeps = trimmedImports.map(module => globalProp(module.globalName, globalVar));
	const factoryArgs = trimmedImports.map(m => m.name);

	if (namedExportsMode && (hasExports || noConflict)) {
		amdDeps.unshift(`'exports'`);
		cjsDeps.unshift(`exports`);
		globalDeps.unshift(
			assignToDeepVariable(
				name!,
				globalVar,
				globals,
				compact,
				`${extend ? `${globalProp(name!, globalVar)}${_}||${_}` : ''}{}`
			)
		);

		factoryArgs.unshift('exports');
	}

	const amdParams =
		(amdId ? `'${amdId}',${_}` : ``) + (amdDeps.length ? `[${amdDeps.join(`,${_}`)}],${_}` : ``);

	const define = amdDefine;
	const cjsExport = !namedExportsMode && hasExports ? `module.exports${_}=${_}` : ``;
	const useStrict = strict ? `${_}'use strict';${n}` : ``;

	let iifeExport;

	if (noConflict) {
		const noConflictExportsVar = compact ? 'e' : 'exports';
		let factory;

		if (!namedExportsMode && hasExports) {
			factory = `var ${noConflictExportsVar}${_}=${_}${assignToDeepVariable(
				name!,
				globalVar,
				globals,
				compact,
				`${factoryVar}(${globalDeps.join(`,${_}`)})`
			)};`;
		} else {
			const module = globalDeps.shift();
			factory =
				`var ${noConflictExportsVar}${_}=${_}${module};${n}` +
				`${t}${t}${factoryVar}(${[noConflictExportsVar].concat(globalDeps).join(`,${_}`)});`;
		}
		iifeExport =
			`(function${_}()${_}{${n}` +
			`${t}${t}var current${_}=${_}${safeAccess(name!, globalVar, _)};${n}` +
			`${t}${t}${factory}${n}` +
			`${t}${t}${noConflictExportsVar}.noConflict${_}=${_}function${_}()${_}{${_}` +
			`${globalProp(name!, globalVar)}${_}=${_}current;${_}return ${noConflictExportsVar}${
				compact ? '' : '; '
			}};${n}` +
			`${t}}())`;
	} else {
		iifeExport = `${factoryVar}(${globalDeps.join(`,${_}`)})`;
		if (!namedExportsMode && hasExports) {
			iifeExport = assignToDeepVariable(name!, globalVar, globals, compact, iifeExport);
		}
	}

	const iifeNeedsGlobal = hasExports || (noConflict && namedExportsMode) || globalDeps.length > 0;
	const globalParam = iifeNeedsGlobal ? `${globalVar},${_}` : '';
	const globalArg = iifeNeedsGlobal ? `this,${_}` : '';
	const iifeStart = iifeNeedsGlobal
		? `(${globalVar}${_}=${_}typeof globalThis${_}!==${_}'undefined'${_}?${_}globalThis${_}:${_}${globalVar}${_}||${_}self,${_}`
		: '';
	const iifeEnd = iifeNeedsGlobal ? ')' : '';
	const cjsIntro = iifeNeedsGlobal
		? `${t}typeof exports${_}===${_}'object'${_}&&${_}typeof module${_}!==${_}'undefined'${_}?` +
		  `${_}${cjsExport}${factoryVar}(${cjsDeps.join(`,${_}`)})${_}:${n}`
		: '';

	// factory function should be wrapped by parentheses to avoid lazy parsing
	const wrapperIntro =
		`(function${_}(${globalParam}${factoryVar})${_}{${n}` +
		cjsIntro +
		`${t}typeof ${define}${_}===${_}'function'${_}&&${_}${define}.amd${_}?${_}${define}(${amdParams}${factoryVar})${_}:${n}` +
		`${t}${iifeStart}${iifeExport}${iifeEnd};${n}` +
		`}(${globalArg}(function${_}(${factoryArgs.join(', ')})${_}{${useStrict}${n}`;

	const wrapperOutro = n + n + '})));';

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
	if (namedExportsMode && hasExports && esModule)
		magicString.append(n + n + (compact ? compactEsModuleExport : esModuleExport));
	if (outro) magicString.append(outro);

	return magicString.trim().indent(t).append(wrapperOutro).prepend(wrapperIntro);
}
