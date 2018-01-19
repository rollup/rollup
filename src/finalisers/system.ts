import Chunk from '../Chunk';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/index';

export default function system (
	chunk: Chunk,
	magicString: MagicStringBundle,
	{ getPath, indentString: t, intro, outro }: {
		indentString: string;
		getPath: (name: string) => string;
		intro: string;
		outro: string
	},
	_options: OutputOptions
) {
	const { dependencies, exports } = chunk.getModuleDeclarations();

	const deps = dependencies.map(m => `'${getPath(m.id)}'`);

	const importBindings: string[] = [];
	let starExcludes: string[];
	const setters: string[] = [];
	const varOrConst = chunk.graph.varOrConst;

	dependencies.forEach(dep => {
		let setter: string[] = [];
		if (dep.imports) {
			dep.imports.forEach(specifier => {
				importBindings.push(specifier.local);
				if (specifier.imported === '*') {
					setter.push(`${specifier.local} = module;`);
				} else {
					setter.push(`${specifier.local} = module.${specifier.imported};`);
				}
			});
		}
		if (dep.reexports) {
			// bulk-reexport form
			if (dep.reexports.length > 1 || dep.reexports.length === 1 && dep.reexports[0].imported === '*') {
				setter.push(`${varOrConst} _setter = {};`);
				// star reexports
				dep.reexports.forEach(specifier => {
					if (specifier.imported !== '*')
						return;
					// need own exports list for deduping in star export case
					if (!starExcludes) {
						starExcludes = exports.map(expt => expt.exported);
						if (starExcludes.indexOf('default') === -1)
							starExcludes.push('default');
						// also include reexport names
						dependencies.forEach(dep => {
							dep.reexports.forEach(reexport => {
								if (reexport.imported !== '*' && starExcludes.indexOf(reexport.reexported) === -1)
									starExcludes.push(reexport.reexported);
							});
						});
					}
					setter.push(`for (var _$p in module) {`);
					setter.push(`${t}if (!starExcludes[_$p]) _setter[_$p] = module[_$p];`);
					setter.push('}');
				});
				// reexports
				dep.reexports.forEach(specifier => {
					if (specifier.imported === '*')
						return;
					setter.push(`_setter.${specifier.reexported} = module.${specifier.imported};`);
				});
				setter.push('exports(_setter);');
			}
			// single reexport
			else {
				dep.reexports.forEach(specifier => {
					setter.push(`exports('${specifier.reexported}', module.${specifier.imported});`);
				});
			}
		}
		setters.push(setter.join(`\n${t}${t}${t}`));
	});

	// function declarations hoist
	const functionExports: string[] = [];
	exports.forEach(expt => {
		if (expt.hoisted)
			functionExports.push(`exports('${expt.exported}', ${expt.local});`);
	});

	const starExcludesSection = !starExcludes ? '' :
			`\n${t}${varOrConst} _starExcludes = { ${starExcludes.join(': 1, ')}${starExcludes.length ? ': 1' : ''} };`;

	const importBindingsSection = importBindings.length ? `\n${t}var ${importBindings.join(', ')};` : '';

	const wrapperStart = `System.register([${deps.join(', ')}], function (exports, module) {
${t}'use strict';${starExcludesSection}${importBindingsSection}
${t}return {${setters.length ? `\n${t}${t}setters: [${setters.map(s => `function (module) {
${t}${t}${t}${s}
${t}${t}}`).join(', ')}],` : ''}
${t}${t}execute: function () {

${functionExports.length ? `${t}${t}${t}` + functionExports.join(`\n${t}${t}${t}`) + '\n' : ''}`;

	if (intro) magicString.prepend(intro);

	if (outro) (<any> magicString).append(outro);

	return (<any> magicString) // TODO TypeScript: Awaiting PR
		.indent(`${t}${t}${t}`)
		.append(`\n\n${t}${t}}\n${t}};\n});`)
		.prepend(wrapperStart);
}
