import type { Bundle as MagicStringBundle } from 'magic-string';
import type { NormalizedOutputOptions } from '../rollup/types';
import type { GenerateCodeSnippets } from '../utils/generateCodeSnippets';
import { error, logMissingNameOptionForUmdExport } from '../utils/logs';
import getCompleteAmdId from './shared/getCompleteAmdId';
import { getExportBlock, getNamespaceMarkers } from './shared/getExportBlock';
import getInteropBlock from './shared/getInteropBlock';
import { keypath } from './shared/sanitize';
import { assignToDeepVariable } from './shared/setupNamespace';
import trimEmptyImports from './shared/trimEmptyImports';
import updateExtensionForRelativeAmdId from './shared/updateExtensionForRelativeAmdId';
import warnOnBuiltins from './shared/warnOnBuiltins';
import type { FinaliserOptions } from './index';

function globalProperty(
	name: string | false | undefined,
	globalVariable: string,
	getPropertyAccess: (name: string) => string
) {
	if (!name) return 'null';
	return `${globalVariable}${keypath(name, getPropertyAccess)}`;
}

function safeAccess(
	name: string,
	globalVariable: string,
	{ _, getPropertyAccess }: GenerateCodeSnippets
) {
	let propertyPath = globalVariable;
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
		hasDefaultExport,
		hasExports,
		id,
		indent: t,
		intro,
		namedExportsMode,
		log,
		outro,
		snippets
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
		generatedCode: { symbols },
		globals,
		noConflict,
		strict
	}: NormalizedOutputOptions
): void {
	const { _, cnst, getFunctionIntro, getNonArrowFunctionIntro, getPropertyAccess, n, s } = snippets;
	const factoryVariable = compact ? 'f' : 'factory';
	const globalVariable = compact ? 'g' : 'global';

	if (hasExports && !name) {
		return error(logMissingNameOptionForUmdExport());
	}

	warnOnBuiltins(log, dependencies);

	const amdDeps = dependencies.map(
		m => `'${updateExtensionForRelativeAmdId(m.importPath, amd.forceJsExtensionForImports)}'`
	);
	const cjsDeps = dependencies.map(m => `require('${m.importPath}')`);

	const trimmedImports = trimEmptyImports(dependencies);
	const globalDeps = trimmedImports.map(module =>
		globalProperty(module.globalName, globalVariable, getPropertyAccess)
	);
	const factoryParameters = trimmedImports.map(m => m.name);

	if (namedExportsMode && (hasExports || noConflict)) {
		amdDeps.unshift(`'exports'`);
		cjsDeps.unshift(`exports`);
		globalDeps.unshift(
			assignToDeepVariable(
				name!,
				globalVariable,
				globals,
				`${
					extend ? `${globalProperty(name!, globalVariable, getPropertyAccess)}${_}||${_}` : ''
				}{}`,
				snippets
			)
		);

		factoryParameters.unshift('exports');
	}

	const completeAmdId = getCompleteAmdId(amd, id);
	const amdParameters =
		(completeAmdId ? `'${completeAmdId}',${_}` : ``) +
		(amdDeps.length > 0 ? `[${amdDeps.join(`,${_}`)}],${_}` : ``);

	const define = amd.define;
	const cjsExport = !namedExportsMode && hasExports ? `module.exports${_}=${_}` : ``;
	const useStrict = strict ? `${_}'use strict';${n}` : ``;

	let iifeExport;

	if (noConflict) {
		const noConflictExportsVariable = compact ? 'e' : 'exports';
		let factory;

		if (!namedExportsMode && hasExports) {
			factory = `${cnst} ${noConflictExportsVariable}${_}=${_}${assignToDeepVariable(
				name!,
				globalVariable,
				globals,
				`${factoryVariable}(${globalDeps.join(`,${_}`)})`,
				snippets
			)};`;
		} else {
			const module = globalDeps.shift();
			factory =
				`${cnst} ${noConflictExportsVariable}${_}=${_}${module};${n}` +
				`${t}${t}${factoryVariable}(${[noConflictExportsVariable, ...globalDeps].join(`,${_}`)});`;
		}
		iifeExport =
			`(${getFunctionIntro([], { isAsync: false, name: null })}{${n}` +
			`${t}${t}${cnst} current${_}=${_}${safeAccess(name!, globalVariable, snippets)};${n}` +
			`${t}${t}${factory}${n}` +
			`${t}${t}${noConflictExportsVariable}.noConflict${_}=${_}${getFunctionIntro([], {
				isAsync: false,
				name: null
			})}{${_}` +
			`${globalProperty(
				name!,
				globalVariable,
				getPropertyAccess
			)}${_}=${_}current;${_}return ${noConflictExportsVariable}${s}${_}};${n}` +
			`${t}})()`;
	} else {
		iifeExport = `${factoryVariable}(${globalDeps.join(`,${_}`)})`;
		if (!namedExportsMode && hasExports) {
			iifeExport = assignToDeepVariable(name!, globalVariable, globals, iifeExport, snippets);
		}
	}

	const iifeNeedsGlobal = hasExports || (noConflict && namedExportsMode) || globalDeps.length > 0;
	const wrapperParameters: string[] = [factoryVariable];
	if (iifeNeedsGlobal) {
		wrapperParameters.unshift(globalVariable);
	}
	const globalArgument = iifeNeedsGlobal ? `this,${_}` : '';
	const iifeStart = iifeNeedsGlobal
		? `(${globalVariable}${_}=${_}typeof globalThis${_}!==${_}'undefined'${_}?${_}globalThis${_}:${_}${globalVariable}${_}||${_}self,${_}`
		: '';
	const iifeEnd = iifeNeedsGlobal ? ')' : '';
	const cjsIntro = iifeNeedsGlobal
		? `${t}typeof exports${_}===${_}'object'${_}&&${_}typeof module${_}!==${_}'undefined'${_}?` +
			`${_}${cjsExport}${factoryVariable}(${cjsDeps.join(`,${_}`)})${_}:${n}`
		: '';

	const wrapperIntro =
		`(${getNonArrowFunctionIntro(wrapperParameters, { isAsync: false, name: null })}{${n}` +
		cjsIntro +
		`${t}typeof ${define}${_}===${_}'function'${_}&&${_}${define}.amd${_}?${_}${define}(${amdParameters}${factoryVariable})${_}:${n}` +
		`${t}${iifeStart}${iifeExport}${iifeEnd};${n}` +
		// factory function should be wrapped by parentheses to avoid lazy parsing,
		// cf. https://v8.dev/blog/preparser#pife
		`})(${globalArgument}(${getNonArrowFunctionIntro(factoryParameters, {
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
			symbols,
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
		esModule === true || (esModule === 'if-default-prop' && hasDefaultExport),
		symbols,
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
