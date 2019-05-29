import { Bundle as MagicStringBundle } from 'magic-string';
import { ChunkExports, ModuleDeclarations } from '../Chunk';
import { OutputOptions } from '../rollup/types';
import { MISSING_EXPORT_SHIM_VARIABLE } from '../utils/variableNames';
import { FinaliserOptions } from './index';

function getStarExcludes({ dependencies, exports }: ModuleDeclarations): Set<string> {
	const starExcludes = new Set(exports.map(expt => expt.exported));
	if (!starExcludes.has('default')) starExcludes.add('default');
	// also include reexport names
	dependencies.forEach(({ reexports }) => {
		if (reexports)
			reexports.forEach(reexport => {
				if (reexport.imported !== '*' && !starExcludes.has(reexport.reexported))
					starExcludes.add(reexport.reexported);
			});
	});
	return starExcludes;
}

const getStarExcludesBlock = (
	starExcludes: Set<string> | undefined,
	varOrConst: string,
	_: string,
	t: string,
	n: string
): string =>
	starExcludes
		? `${n}${t}${varOrConst} _starExcludes${_}=${_}{${_}${Array.from(starExcludes).join(
				`:${_}1,${_}`
		  )}${starExcludes.size ? `:${_}1` : ''}${_}};`
		: '';

const getImportBindingsBlock = (
	importBindings: string[],
	_: string,
	t: string,
	n: string
): string => (importBindings.length ? `${n}${t}var ${importBindings.join(`,${_}`)};` : '');

function getExportsBlock(
	exports: { name: string; value: string }[],
	_: string,
	t: string,
	n: string
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

const getHoistedExportsBlock = (exports: ChunkExports, _: string, t: string, n: string): string =>
	getExportsBlock(
		exports
			.filter(expt => expt.hoisted || expt.uninitialized)
			.map(expt => ({ name: expt.exported, value: expt.uninitialized ? 'void 0' : expt.local })),
		_,
		t,
		n
	);

const getMissingExportsBlock = (exports: ChunkExports, _: string, t: string, n: string): string =>
	getExportsBlock(
		exports
			.filter(expt => expt.local === MISSING_EXPORT_SHIM_VARIABLE)
			.map(expt => ({ name: expt.exported, value: MISSING_EXPORT_SHIM_VARIABLE })),
		_,
		t,
		n
	);

export default function system(
	magicString: MagicStringBundle,
	{
		accessedGlobals,
		dependencies,
		exports,
		hasExports,
		indentString: t,
		intro,
		outro,
		usesTopLevelAwait,
		varOrConst
	}: FinaliserOptions,
	options: OutputOptions
) {
	const n = options.compact ? '' : '\n';
	const _ = options.compact ? '' : ' ';

	const dependencyIds = dependencies.map(m => `'${m.id}'`);

	const importBindings: string[] = [];
	let starExcludes: Set<string> | undefined;
	const setters: string[] = [];

	dependencies.forEach(({ imports, reexports }) => {
		const setter: string[] = [];
		if (imports) {
			imports.forEach(specifier => {
				importBindings.push(specifier.local);
				if (specifier.imported === '*') {
					setter.push(`${specifier.local}${_}=${_}module;`);
				} else {
					setter.push(`${specifier.local}${_}=${_}module.${specifier.imported};`);
				}
			});
		}
		if (reexports) {
			let createdSetter = false;
			// bulk-reexport form
			if (
				reexports.length > 1 ||
				(reexports.length === 1 &&
					(reexports[0].reexported === '*' || reexports[0].imported === '*'))
			) {
				// star reexports
				reexports.forEach(specifier => {
					if (specifier.reexported !== '*') return;
					// need own exports list for deduping in star export case
					if (!starExcludes) {
						starExcludes = getStarExcludes({ dependencies, exports });
					}
					if (!createdSetter) {
						setter.push(`${varOrConst} _setter${_}=${_}{};`);
						createdSetter = true;
					}
					setter.push(`for${_}(var _$p${_}in${_}module)${_}{`);
					setter.push(`${t}if${_}(!_starExcludes[_$p])${_}_setter[_$p]${_}=${_}module[_$p];`);
					setter.push('}');
				});
				// star import reexport
				reexports.forEach(specifier => {
					if (specifier.imported !== '*' || specifier.reexported === '*') return;
					setter.push(`exports('${specifier.reexported}',${_}module);`);
				});
				// reexports
				reexports.forEach(specifier => {
					if (specifier.reexported === '*' || specifier.imported === '*') return;
					if (!createdSetter) {
						setter.push(`${varOrConst} _setter${_}=${_}{};`);
						createdSetter = true;
					}
					setter.push(`_setter.${specifier.reexported}${_}=${_}module.${specifier.imported};`);
				});
				if (createdSetter) {
					setter.push('exports(_setter);');
				}
			} else {
				// single reexport
				reexports.forEach(specifier => {
					setter.push(`exports('${specifier.reexported}',${_}module.${specifier.imported});`);
				});
			}
		}
		setters.push(setter.join(`${n}${t}${t}${t}`));
	});

	const registeredName = options.name ? `'${options.name}',${_}` : '';
	const wrapperParams = accessedGlobals.has('module')
		? `exports,${_}module`
		: hasExports
		? 'exports'
		: '';

	let wrapperStart =
		`System.register(${registeredName}[` +
		dependencyIds.join(`,${_}`) +
		`],${_}function${_}(${wrapperParams})${_}{${n}${t}'use strict';` +
		getStarExcludesBlock(starExcludes, varOrConst, _, t, n) +
		getImportBindingsBlock(importBindings, _, t, n) +
		`${n}${t}return${_}{${
			setters.length
				? `${n}${t}${t}setters:${_}[${setters
						.map(s =>
							s
								? `function${_}(module)${_}{${n}${t}${t}${t}${s}${n}${t}${t}}`
								: `function${_}()${_}{}`
						)
						.join(`,${_}`)}],`
				: ''
		}${n}`;
	wrapperStart +=
		`${t}${t}execute:${_}${usesTopLevelAwait ? `async${_}` : ''}function${_}()${_}{${n}${n}` +
		getHoistedExportsBlock(exports, _, t, n);

	const wrapperEnd =
		`${n}${n}` +
		getMissingExportsBlock(exports, _, t, n) +
		`${t}${t}}${n}${t}}${options.compact ? '' : ';'}${n}});`;

	if (intro) magicString.prepend(intro);
	if (outro) magicString.append(outro);
	return magicString
		.indent(`${t}${t}${t}`)
		.append(wrapperEnd)
		.prepend(wrapperStart);
}
