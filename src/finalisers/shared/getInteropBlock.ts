import { ModuleDeclarationDependency } from '../../Chunk';
import { NormalizedOutputOptions } from '../../rollup/types';

export default function getInteropBlock(
	dependencies: ModuleDeclarationDependency[],
	options: NormalizedOutputOptions,
	varOrConst: string
) {
	const _ = options.compact ? '' : ' ';

	return dependencies
		.map(({ name, exportsNames, exportsDefault, namedExportsMode }) => {
			if (!(namedExportsMode && exportsDefault && options.interop)) return null;

			if (exportsNames) {
				return (
					`${varOrConst} ${name}__default${_}=${_}'default'${_}in ${name}${_}?` +
					`${_}${name}['default']${_}:${_}${name};`
				);
			}

			return (
				`${name}${_}=${_}${name}${_}&&${_}Object.prototype.hasOwnProperty.call(${name},${_}'default')${_}?` +
				`${_}${name}['default']${_}:${_}${name};`
			);
		})
		.filter(Boolean)
		.join(options.compact ? '' : '\n');
}
