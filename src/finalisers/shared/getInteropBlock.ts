import { ModuleDeclarationDependency } from '../../Chunk';
import { INTEROP_DEFAULT_VARIABLE } from '../../utils/variableNames';

export default function getInteropBlock(
	dependencies: ModuleDeclarationDependency[],
	varOrConst: string,
	compact: boolean,
	interop: boolean,
	_: string,
	n: string
): string {
	// TODO Lukas will this ever result in unneeded interop handlers?
	// Maybe we do not need the check for imports if we do not assign exportsDefault if the variable is not used
	// And what about dependencies in code-splitting mode where the default is not used in this chunk?
	// TODO Lukas when a namespace is imported and we lose track, shouldn't we use the interop helper for namespaces?
	const interopBlock = dependencies
		.map(({ name, exportsNames, exportsDefault, imports, namedExportsMode, reexports }) => {
			if (!((imports || reexports) && namedExportsMode && exportsDefault && interop)) return null;

			// TODO Lukas reassigning the existing variable defeats the goal of making this easily inlineable
			return `${
				exportsNames ? `${varOrConst} ${name}__default` : name
			}${_}=${_}${INTEROP_DEFAULT_VARIABLE}(${name});`;
		})
		.filter(Boolean)
		.join(n);
	if (interopBlock) {
		const ex = compact ? 'e' : 'ex';
		return (
			`function ${INTEROP_DEFAULT_VARIABLE}${_}(${ex})${_}{${_}return${_}` +
			`(${ex}${_}&&${_}(typeof ${ex}${_}===${_}'object')${_}&&${_}'default'${_}in ${ex})${_}` +
			`?${_}${ex}['default']${_}:${_}${ex}${compact ? '' : '; '}}${n}${n}` +
			`${interopBlock}${n}${n}`
		);
	}
	return '';
}
