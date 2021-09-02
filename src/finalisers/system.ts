import { Bundle, Bundle as MagicStringBundle } from 'magic-string';
import { ChunkDependencies, ChunkExports, ModuleDeclarations } from '../Chunk';
import { NormalizedOutputOptions } from '../rollup/types';
import { GenerateCodeSnippets } from '../utils/generateCodeSnippets';
import { MISSING_EXPORT_SHIM_VARIABLE } from '../utils/variableNames';
import { FinaliserOptions } from './index';

export default function system(
	magicString: MagicStringBundle,
	{
		accessedGlobals,
		dependencies,
		exports,
		hasExports,
		indent: t,
		intro,
		snippets,
		outro,
		usesTopLevelAwait,
		varOrConst
	}: FinaliserOptions,
	options: NormalizedOutputOptions
): Bundle {
	const { _, getFunctionIntro, getNonArrowFunctionIntro, n, s } = snippets;
	const { importBindings, setters, starExcludes } = analyzeDependencies(
		dependencies,
		exports,
		varOrConst,
		t,
		snippets
	);
	const registeredName = options.name ? `'${options.name}',${_}` : '';
	const wrapperParams = accessedGlobals.has('module')
		? ['exports', 'module']
		: hasExports
		? ['exports']
		: [];

	// factory function should be wrapped by parentheses to avoid lazy parsing,
	// cf. https://v8.dev/blog/preparser#pife
	let wrapperStart =
		`System.register(${registeredName}[` +
		dependencies.map(({ id }) => `'${id}'`).join(`,${_}`) +
		`],${_}(${getNonArrowFunctionIntro(wrapperParams, { isAsync: false, name: null })}{${n}${t}${
			options.strict ? "'use strict';" : ''
		}` +
		getStarExcludesBlock(starExcludes, varOrConst, t, snippets) +
		getImportBindingsBlock(importBindings, t, snippets) +
		`${n}${t}return${_}{${
			setters.length
				? `${n}${t}${t}setters:${_}[${setters
						.map(setter =>
							setter
								? `${getFunctionIntro(['module'], {
										isAsync: false,
										name: null
								  })}{${n}${t}${t}${t}${setter}${n}${t}${t}}`
								: options.systemNullSetters
								? `null`
								: `${getFunctionIntro([], { isAsync: false, name: null })}{}`
						)
						.join(`,${_}`)}],`
				: ''
		}${n}`;
	wrapperStart +=
		`${t}${t}execute:${_}(${getNonArrowFunctionIntro([], {
			isAsync: usesTopLevelAwait,
			name: null
		})}{${n}${n}` + getHoistedExportsBlock(exports, t, snippets);

	const wrapperEnd =
		`${n}${n}` +
		getSyntheticExportsBlock(exports, t, snippets) +
		getMissingExportsBlock(exports, t, snippets) +
		`${t}${t}})${n}${t}}${s}${n}}));`;

	if (intro) magicString.prepend(intro);
	if (outro) magicString.append(outro);
	return magicString.indent(`${t}${t}${t}`).append(wrapperEnd).prepend(wrapperStart);
}

function analyzeDependencies(
	dependencies: ChunkDependencies,
	exports: ChunkExports,
	varOrConst: 'var' | 'const',
	t: string,
	{ _, getObject, getPropertyAccess, n }: GenerateCodeSnippets
): { importBindings: string[]; setters: string[]; starExcludes: Set<string> | null } {
	const importBindings: string[] = [];
	const setters: string[] = [];
	let starExcludes: Set<string> | null = null;

	for (const { imports, reexports } of dependencies) {
		const setter: string[] = [];
		if (imports) {
			for (const specifier of imports) {
				importBindings.push(specifier.local);
				if (specifier.imported === '*') {
					setter.push(`${specifier.local}${_}=${_}module;`);
				} else {
					setter.push(`${specifier.local}${_}=${_}module${getPropertyAccess(specifier.imported)};`);
				}
			}
		}
		if (reexports) {
			const reexportedNames: [key: string | null, value: string][] = [];
			let hasStarReexport = false;
			for (const { imported, reexported } of reexports) {
				if (reexported === '*') {
					hasStarReexport = true;
				} else {
					reexportedNames.push([
						reexported,
						imported === '*' ? 'module' : `module${getPropertyAccess(imported)}`
					]);
				}
			}
			if (reexportedNames.length > 1 || hasStarReexport) {
				const exportMapping = getObject(reexportedNames, { indent: _, lineBreaks: false });
				if (hasStarReexport) {
					if (!starExcludes) {
						starExcludes = getStarExcludes({ dependencies, exports });
					}
					setter.push(
						`${varOrConst} setter${_}=${_}${exportMapping};`,
						// TODO Lukas const
						`for${_}(var name${_}in${_}module)${_}{`,
						`${t}if${_}(!_starExcludes[name])${_}setter[name]${_}=${_}module[name];`,
						'}',
						'exports(setter);'
					);
				} else {
					setter.push(`exports(${exportMapping});`);
				}
			} else {
				const [key, value] = reexportedNames[0];
				setter.push(`exports('${key}',${_}${value});`);
			}
		}
		setters.push(setter.join(`${n}${t}${t}${t}`));
	}
	return { importBindings, setters, starExcludes };
}

const getStarExcludes = ({ dependencies, exports }: ModuleDeclarations): Set<string> => {
	const starExcludes = new Set(exports.map(expt => expt.exported));
	starExcludes.add('default');
	for (const { reexports } of dependencies) {
		if (reexports) {
			for (const reexport of reexports) {
				if (reexport.reexported !== '*') starExcludes.add(reexport.reexported);
			}
		}
	}
	return starExcludes;
};

const getStarExcludesBlock = (
	starExcludes: Set<string> | null,
	varOrConst: string,
	t: string,
	{ _, getObject, n }: GenerateCodeSnippets
): string =>
	starExcludes
		? `${n}${t}${varOrConst} _starExcludes${_}=${_}${getObject(
				[...starExcludes].map(prop => [prop, '1']),
				{ indent: _, lineBreaks: false }
		  )};`
		: '';

// TODO Lukas use let instead of var
const getImportBindingsBlock = (
	importBindings: string[],
	t: string,
	{ _, n }: GenerateCodeSnippets
): string => (importBindings.length ? `${n}${t}var ${importBindings.join(`,${_}`)};` : '');

const getHoistedExportsBlock = (
	exports: ChunkExports,
	t: string,
	snippets: GenerateCodeSnippets
): string =>
	getExportsBlock(
		exports.filter(expt => expt.hoisted).map(expt => ({ name: expt.exported, value: expt.local })),
		t,
		snippets
	);

function getExportsBlock(
	exports: { name: string; value: string }[],
	t: string,
	{ _, n }: GenerateCodeSnippets
): string {
	if (exports.length === 0) {
		return '';
	}
	if (exports.length === 1) {
		return `${t}${t}${t}exports('${exports[0].name}',${_}${exports[0].value});${n}${n}`;
	}
	return (
		`${t}${t}${t}exports({${n}` +
		exports.map(({ name, value }) => `${t}${t}${t}${t}${name}:${_}${value}`).join(`,${n}`) +
		`${n}${t}${t}${t}});${n}${n}`
	);
}

const getSyntheticExportsBlock = (
	exports: ChunkExports,
	t: string,
	snippets: GenerateCodeSnippets
): string =>
	getExportsBlock(
		exports
			.filter(expt => expt.expression)
			.map(expt => ({ name: expt.exported, value: expt.local })),
		t,
		snippets
	);

const getMissingExportsBlock = (
	exports: ChunkExports,
	t: string,
	snippets: GenerateCodeSnippets
): string =>
	getExportsBlock(
		exports
			.filter(expt => expt.local === MISSING_EXPORT_SHIM_VARIABLE)
			.map(expt => ({ name: expt.exported, value: MISSING_EXPORT_SHIM_VARIABLE })),
		t,
		snippets
	);
