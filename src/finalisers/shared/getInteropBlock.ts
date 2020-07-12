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
	if (!interop) {
		return '';
	}
	// TODO Lukas when a namespace is imported and we lose track, shouldn't we use the interop helper for namespaces?
	// TODO Lukas define interop per module and add a function way to define interop per output on first default import; test double default imports; make sure different outputs do not interact
	const interopBlock = dependencies
		.map(({ defaultVariableName, name, imports, reexports, isChunk }) => {
			if (!isChunk) {
				for (const { imported } of [...(imports || []), ...(reexports || [])]) {
					if (imported === 'default') {
						return `${varOrConst} ${defaultVariableName}${_}=${_}${INTEROP_DEFAULT_VARIABLE}(${name});`;
					}
				}
			}
		})
		.filter(Boolean)
		.join(n);
	if (interopBlock) {
		const ex = compact ? 'e' : 'ex';
		return (
			`function ${INTEROP_DEFAULT_VARIABLE}${_}(${ex})${_}{${_}return${_}` +
			`(${ex}${_}&&${_}(typeof ${ex}${_}===${_}'object')${_}&&${_}'default'${_}in ${ex})${_}` +
			`?${_}${ex}${_}:${_}{${_}'default':${_}${ex}${_}}${compact ? '' : '; '}}${n}${n}` +
			`${interopBlock}${n}${n}`
		);
	}
	return '';
}
