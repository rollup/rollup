import { OutputOptions } from '../../rollup/index';
import { ModuleDeclarationDependency } from '../../Chunk';

export default function getInteropBlock(
	dependencies: ModuleDeclarationDependency[],
	options: OutputOptions,
	varOrConst: string
) {
	return dependencies
		.map(({ name, exportsNamespace, exportsNames, exportsDefault }) => {
			if (!exportsDefault || options.interop === false) return null;

			if (exportsNamespace) return `${varOrConst} ${name}__default = ${name}['default'];`;

			if (exportsNames)
				return `${varOrConst} ${name}__default = 'default' in ${name} ? ${name}['default'] : ${name};`;

			return `${name} = ${name} && ${name}.hasOwnProperty('default') ? ${name}['default'] : ${name};`;
		})
		.filter(Boolean)
		.join('\n');
}
