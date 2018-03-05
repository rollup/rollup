import Chunk, { ModuleDeclarations } from '../Chunk';
import { Bundle as MagicStringBundle } from 'magic-string';

function getStarExcludes({ dependencies, exports }: ModuleDeclarations) {
	const starExcludes = new Set(exports.map(expt => expt.exported));
	if (!starExcludes.has('default')) starExcludes.add('default');
	// also include reexport names
	dependencies.forEach(({ reexports }) => {
		if (reexports)
			reexports.forEach(reexport => {
				if (reexport.imported !== '*' && !starExcludes.has(reexport.reexported)) starExcludes.add(reexport.reexported);
			});
	});
	return starExcludes;
}

export default function system(
	chunk: Chunk,
	magicString: MagicStringBundle,
	{
		getPath,
		indentString: t,
		intro,
		outro
	}: {
		indentString: string;
		getPath: (name: string) => string;
		intro: string;
		outro: string;
	}
) {
	const { dependencies, exports } = chunk.getModuleDeclarations();

	const dependencyIds = dependencies.map(m => `'${getPath(m.id)}'`);

	const importBindings: string[] = [];
	let starExcludes: Set<string>;
	const setters: string[] = [];
	const varOrConst = chunk.graph.varOrConst;

	dependencies.forEach(({ imports, reexports }) => {
		let setter: string[] = [];
		if (imports) {
			imports.forEach(specifier => {
				importBindings.push(specifier.local);
				if (specifier.imported === '*') {
					setter.push(`${specifier.local} = module;`);
				} else {
					setter.push(`${specifier.local} = module.${specifier.imported};`);
				}
			});
		}
		if (reexports) {
			let createdSetter = false;
			// bulk-reexport form
			if (
				reexports.length > 1 ||
				(reexports.length === 1 && (reexports[0].reexported === '*' || reexports[0].imported === '*'))
			) {
				// star reexports
				reexports.forEach(specifier => {
					if (specifier.reexported !== '*') return;
					// need own exports list for deduping in star export case
					if (!starExcludes) {
						starExcludes = getStarExcludes({ dependencies, exports });
					}
					if (!createdSetter) {
						setter.push(`${varOrConst} _setter = {};`);
						createdSetter = true;
					}
					setter.push(`for (var _$p in module) {`);
					setter.push(`${t}if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];`);
					setter.push('}');
				});
				// star import reexport
				reexports.forEach(specifier => {
					if (specifier.imported !== '*' || specifier.reexported === '*') return;
					setter.push(`exports('${specifier.reexported}', module);`);
				});
				// reexports
				reexports.forEach(specifier => {
					if (specifier.reexported === '*' || specifier.imported === '*') return;
					if (!createdSetter) {
						setter.push(`${varOrConst} _setter = {};`);
						createdSetter = true;
					}
					setter.push(`_setter.${specifier.reexported} = module.${specifier.imported};`);
				});
				if (createdSetter) {
					setter.push('exports(_setter);');
				}
			} else {
				// single reexport
				reexports.forEach(specifier => {
					setter.push(`exports('${specifier.reexported}', module.${specifier.imported});`);
				});
			}
		}
		setters.push(setter.join(`\n${t}${t}${t}`));
	});

	// function declarations hoist
	const functionExports: string[] = [];
	exports.forEach(expt => {
		if (expt.hoisted) functionExports.push(`exports('${expt.exported}', ${expt.local});`);
	});

	const starExcludesSection = !starExcludes
		? ''
		: `\n${t}${varOrConst} _starExcludes = { ${Array.from(starExcludes).join(': 1, ')}${
				starExcludes.size ? ': 1' : ''
		  } };`;

	const importBindingsSection = importBindings.length ? `\n${t}var ${importBindings.join(', ')};` : '';

	const wrapperStart = `System.register([${dependencyIds.join(', ')}], function (exports, module) {
${t}'use strict';${starExcludesSection}${importBindingsSection}
${t}return {${
		setters.length
			? `\n${t}${t}setters: [${setters
					.map(
						s => `function (module) {
${t}${t}${t}${s}
${t}${t}}`
					)
					.join(', ')}],`
			: ''
	}
${t}${t}execute: function () {

${functionExports.length ? `${t}${t}${t}` + functionExports.join(`\n${t}${t}${t}`) + '\n' : ''}`;

	if (intro) magicString.prepend(intro);

	if (outro) (<any>magicString).append(outro);

	return (<any>magicString) // TODO TypeScript: Awaiting PR
		.indent(`${t}${t}${t}`)
		.append(`\n\n${t}${t}}\n${t}};\n});`)
		.prepend(wrapperStart);
}
