import type { Bundle as MagicStringBundle } from 'magic-string';
import type { NormalizedOutputOptions } from '../rollup/types';
import { errMissingNameOptionForUmdExport, error } from '../utils/error';
import type { GenerateCodeSnippets } from '../utils/generateCodeSnippets';
import getCompleteAmdId from './shared/getCompleteAmdId';
import { getExportBlock, getNamespaceMarkers } from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
import { keypath } from './shared/sanitize';
import { assignToDeepVariable } from './shared/setupNamespace';
import trimEmptyImports from './shared/trimEmptyImports';
import updateExtensionForRelativeAmdId from './shared/updateExtensionForRelativeAmdId';
import warnOnBuiltins from './shared/warnOnBuiltins';
import type { FinaliserOptions } from './index';

function globalProp(
	name: string | false | undefined,
	globalVar: string,
	getPropertyAccess: (name: string) => string
) {
	if (!name) return 'null';
	return `${globalVar}${keypath(name, getPropertyAccess)}`;
}

function safeAccess(
	name: string,
	globalVar: string,
	{ _, getPropertyAccess }: GenerateCodeSnippets
) {
	let propertyPath = globalVar;
	return name
		.split('.')
		.map(part => (propertyPath += getPropertyAccess(part)))
		.join(`${_}&&${_}`);
}

export default function umd(
	magicString: MagicStringBundle,
	{
		accessedGlobals,
		dependencies,
		exports,
		hasExports,
		id,
		indent: t,
		intro,
		namedExportsMode,
		outro,
		snippets,
		onwarn
	}: FinaliserOptions,
	{
		amd,
		compact,
		esModule,
		extend,
		externalLiveBindings,
		freeze,
		interop,
		name,
		namespaceToStringTag,
		globals,
		noConflict,
		strict
	}: NormalizedOutputOptions
): void {
	const { _, cnst, getFunctionIntro, getNonArrowFunctionIntro, getPropertyAccess, n, s } = snippets;
	const factoryVar = compact ? 'f' : 'factory';
	const globalVar = compact ? 'g' : 'global';

	if (hasExports && !name) {
		return error(errMissingNameOptionForUmdExport());
	}

	warnOnBuiltins(onwarn, dependencies);

	const amdDeps = dependencies.map(
		m => `'${updateExtensionForRelativeAmdId(m.importPath, amd.forceJsExtensionForImports)}'`
	);
	const cjsDeps = dependencies.map(m => `require('${m.importPath}')`);

	const trimmedImports = trimEmptyImports(dependencies);
	const globalDeps = trimmedImports.map(module =>
		globalProp(module.globalName, globalVar, getPropertyAccess)
	);
	const factoryParams = trimmedImports.map(m => m.name);

	if (namedExportsMode && (hasExports || noConflict)) {
		amdDeps.unshift(`'exports'`);
		cjsDeps.unshift(`exports`);
		globalDeps.unshift(
			assignToDeepVariable(
				name!,
				globalVar,
				globals,
				`${extend ? `${globalProp(name!, globalVar, getPropertyAccess)}${_}||${_}` : ''}{}`,
				snippets
			)
		);

		factoryParams.unshift('exports');
	}

	const completeAmdId = getCompleteAmdId(amd, id);
	const amdParams =
		(completeAmdId ? `'${completeAmdId}',${_}` : ``) +
		(amdDeps.length ? `[${amdDeps.join(`,${_}`)}],${_}` : ``);

	const define = amd.define;
	const cjsExport = !namedExportsMode && hasExports ? `module.exports${_}=${_}` : ``;
	const useStrict = strict ? `${_}'use strict';${n}` : ``;

	let iifeExport;

	if (noConflict) {
		const noConflictExportsVar = compact ? 'e' : 'exports';
		let factory;

		if (!namedExportsMode && hasExports) {
			factory = `${cnst} ${noConflictExportsVar}${_}=${_}${assignToDeepVariable(
				name!,
				globalVar,
				globals,
				`${factoryVar}(${globalDeps.join(`,${_}`)})`,
				snippets
			)};`;
		} else {
			const module = globalDeps.shift();
			factory =
				`${cnst} ${noConflictExportsVar}${_}=${_}${module};${n}` +
				`${t}${t}${factoryVar}(${[noConflictExportsVar].concat(globalDeps).join(`,${_}`)});`;
		}
		iifeExport =
			`(${getFunctionIntro([], { isAsync: false, name: null })}{${n}` +
			`${t}${t}${cnst} current${_}=${_}${safeAccess(name!, globalVar, snippets)};${n}` +
			`${t}${t}${factory}${n}` +
			`${t}${t}${noConflictExportsVar}.noConflict${_}=${_}${getFunctionIntro([], {
				isAsync: false,
				name: null
			})}{${_}` +
			`${globalProp(
				name!,
				globalVar,
				getPropertyAccess
			)}${_}=${_}current;${_}return ${noConflictExportsVar}${s}${_}};${n}` +
			`${t}})()`;
	} else {
		iifeExport = `${factoryVar}(${globalDeps.join(`,${_}`)})`;
		if (!namedExportsMode && hasExports) {
			iifeExport = assignToDeepVariable(name!, globalVar, globals, iifeExport, snippets);
		}
	}

	const iifeNeedsGlobal = hasExports || (noConflict && namedExportsMode) || globalDeps.length > 0;
	const wrapperParams: string[] = [factoryVar];
	if (iifeNeedsGlobal) {
		wrapperParams.unshift(globalVar);
	}
	const globalArg = iifeNeedsGlobal ? `this,${_}` : '';
	const iifeStart = iifeNeedsGlobal
		? `(${globalVar}${_}=${_}typeof globalThis${_}!==${_}'undefined'${_}?${_}globalThis${_}:${_}${globalVar}${_}||${_}self,${_}`
		: '';
	const iifeEnd = iifeNeedsGlobal ? ')' : '';
	const cjsIntro = iifeNeedsGlobal
		? `${t}typeof exports${_}===${_}'object'${_}&&${_}typeof module${_}!==${_}'undefined'${_}?` +
		  `${_}${cjsExport}${factoryVar}(${cjsDeps.join(`,${_}`)})${_}:${n}`
		: '';

	const wrapperIntro =
		`(${getNonArrowFunctionIntro(wrapperParams, { isAsync: false, name: null })}{${n}` +
		cjsIntro +
		`${t}typeof ${define}${_}===${_}'function'${_}&&${_}${define}.amd${_}?${_}${define}(${amdParams}${factoryVar})${_}:${n}` +
		`${t}${iifeStart}${iifeExport}${iifeEnd};${n}` +
		// factory function should be wrapped by parentheses to avoid lazy parsing,
		// cf. https://v8.dev/blog/preparser#pife
		`})(${globalArg}(${getNonArrowFunctionIntro(factoryParams, {
			isAsync: false,
			name: null
		})}{${useStrict}${n}`;

	const wrapperOutro = n + n + '}));';

	magicString.prepend(
		`${intro}${getInteropBlock(
			dependencies,
			interop,
			externalLiveBindings,
			freeze,
			namespaceToStringTag,
			accessedGlobals,
			t,
			snippets
		)}`
	);

	const exportBlock = getExportBlock(
		exports,
		dependencies,
		namedExportsMode,
		interop,
		snippets,
		t,
		externalLiveBindings
	);
	let namespaceMarkers = getNamespaceMarkers(
		namedExportsMode && hasExports,
		esModule,
		namespaceToStringTag,
		snippets
	);
	if (namespaceMarkers) {
		namespaceMarkers = n + n + namespaceMarkers;
	}
	magicString
		.append(`${exportBlock}${namespaceMarkers}${outro}`)
		.trim()
		.indent(t)
		.append(wrapperOutro)
		.prepend(wrapperIntro);
}
