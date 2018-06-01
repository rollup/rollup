import { Bundle as MagicStringBundle } from 'magic-string';
import { ModuleDeclarations } from '../Chunk';
import { OutputOptions } from '../rollup/types';
import { FinaliserOptions } from './index';

function getStarExcludes({ dependencies, exports }: ModuleDeclarations) {
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

export default function system(
	magicString: MagicStringBundle,
	{
		graph,
		indentString: t,
		intro,
		outro,
		dependencies,
		exports,
		usesTopLevelAwait
	}: FinaliserOptions,
	options: OutputOptions
) {
	const n = options.compact ? '' : '\n';
	const _ = options.compact ? '' : ' ';

	const dependencyIds = dependencies.map(m => `'${m.id}'`);

	const importBindings: string[] = [];
	let starExcludes: Set<string>;
	const setters: string[] = [];
	const varOrConst = graph.varOrConst;

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

	// function declarations hoist
	const hoistedExports: string[] = [];

	const hoistedExportObjs = exports.filter(expt => expt.hoisted || expt.uninitialized);
	if (hoistedExportObjs.length === 1) {
		const expt = hoistedExportObjs[0];
		hoistedExports.push(
			`exports('${expt.exported}',${_}${expt.uninitialized ? 'void 0' : expt.local});`
		);
	} else if (hoistedExportObjs.length > 1) {
		hoistedExports.push(`exports({`);
		for (let i = 0; i < hoistedExportObjs.length; i++) {
			const expt = hoistedExportObjs[i];
			hoistedExports.push(
				`${t}${expt.exported}:${_}${expt.uninitialized ? 'void 0' : expt.local}${
					i === hoistedExportObjs.length - 1 ? '' : ','
				}`
			);
		}
		hoistedExports.push(`});`);
	}

	const starExcludesSection = !starExcludes
		? ''
		: `${n}${t}${varOrConst} _starExcludes${_}=${_}{${_}${Array.from(starExcludes).join(
				`:${_}1,${_}`
		  )}${starExcludes.size ? `:${_}1` : ''}${_}};`;

	const importBindingsSection = importBindings.length
		? `${n}${t}var ${importBindings.join(`,${_}`)};`
		: '';
	const registeredName = options.name ? `'${options.name}',${_}` : '';

	let wrapperStart = `System.register(${registeredName}[${dependencyIds.join(
		`,${_}`
	)}],${_}function${_}(exports,${_}module)${_}{${n}`;
	wrapperStart += `${t}'use strict';${starExcludesSection}${importBindingsSection}${n}`;
	wrapperStart += `${t}return${_}{${
		setters.length
			? `${n}${t}${t}setters:${_}[${setters
					.map(
						s =>
							s
								? `function${_}(module)${_}{${n}${t}${t}${t}${s}${n}${t}${t}}`
								: `function${_}()${_}{}`
					)
					.join(`,${_}`)}],`
			: ''
	}${n}`;
	wrapperStart += `${t}${t}execute:${_}${
		usesTopLevelAwait ? `async${_}` : ''
	}function${_}()${_}{${n}${n}`;
	if (hoistedExports.length)
		wrapperStart += `${t}${t}${t}` + hoistedExports.join(`${n}${t}${t}${t}`) + n + n;

	let wrapperEnd = `${n}${n}${t}${t}}`;
	wrapperEnd += `${n}${t}}${options.compact ? '' : ';'}`;
	wrapperEnd += `${n}});`;

	if (intro) magicString.prepend(intro);

	if (outro) magicString.append(outro);

	return magicString
		.indent(`${t}${t}${t}`)
		.append(wrapperEnd)
		.prepend(wrapperStart);
}
