import { ModuleDeclarationDependency, ReexportSpecifier } from '../../Chunk';
import { INTEROP_DEFAULT_VARIABLE, INTEROP_NAMESPACE_VARIABLE } from '../../utils/variableNames';
import { getInteropNamespace } from './getInteropNamespace';

export default function getInteropBlock(
	dependencies: ModuleDeclarationDependency[],
	varOrConst: string,
	compact: boolean,
	interop: boolean,
	externalLiveBindings: boolean,
	freeze: boolean,
	needsNamespaceInterop: boolean,
	_: string,
	n: string,
	t: string
): string {
	if (!interop) {
		return '';
	}
	// TODO Lukas define interop per module and add a function way to define interop per output on first default import; test double default imports; make sure different outputs do not interact
	let needsDefaultInterop = false;
	const interopBlock = dependencies
		.map(({ defaultVariableName, imports, isChunk, name, namespaceVariableName, reexports }) => {
			if (!isChunk) {
				for (const { imported, reexported } of [
					...(imports || []),
					...(reexports || [])
				] as ReexportSpecifier[]) {
					if (imported === 'default') {
						needsDefaultInterop = true;
						return `${varOrConst} ${defaultVariableName}${_}=${_}/*#__PURE__*/${INTEROP_DEFAULT_VARIABLE}(${name});`;
					} else if (imported === '*' && reexported !== '*') {
						needsNamespaceInterop = true;
						return `${varOrConst} ${namespaceVariableName}${_}=${_}/*#__PURE__*/${INTEROP_NAMESPACE_VARIABLE}(${name});`;
					}
				}
			}
		})
		.filter(Boolean)
		.join(n);
	return `${needsDefaultInterop ? getInteropDefault(_, n, compact) : ''}${
		needsNamespaceInterop ? getInteropNamespace(_, n, t, externalLiveBindings, freeze) : ''
	}${interopBlock ? `${interopBlock}${n}${n}` : ''}`;
}

function getInteropDefault(_: string, n: string, compact: boolean) {
	const ex = compact ? 'e' : 'ex';
	const s = compact ? '' : ';';
	return (
		`function ${INTEROP_DEFAULT_VARIABLE}${_}(${ex})${_}{${_}return${_}` +
		`(${ex}${_}&&${_}(typeof ${ex}${_}===${_}'object')${_}&&${_}'default'${_}in ${ex})${_}` +
		`?${_}${ex}${_}:${_}{${_}'default':${_}${ex}${_}}${s}${_}}${n}${n}`
	);
}
