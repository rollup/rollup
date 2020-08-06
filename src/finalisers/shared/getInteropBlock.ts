import { ModuleDeclarationDependency, ReexportSpecifier } from '../../Chunk';
import { GetInterop } from '../../rollup/types';
import {
	defaultInteropHelpersByInteropType,
	getHelpersBlock,
	namespaceInteropHelpersByInteropType
} from '../../utils/interopHelpers';

// TODO Lukas we should have different namespace interop for the "default" case without esModule detection.
// TODO Lukas If both namespace helpers are used, one could call the other
export default function getInteropBlock(
	dependencies: ModuleDeclarationDependency[],
	varOrConst: string,
	interop: GetInterop,
	externalLiveBindings: boolean,
	freeze: boolean,
	accessedGlobals: Set<string>,
	_: string,
	n: string,
	s: string,
	t: string
): string {
	const neededInteropHelpers = new Set<string>();
	// TODO Lukas if we already have the namespace, we could use this instead of the default
	const interopStatements = [];
	for (const {
		defaultVariableName,
		imports,
		id,
		isChunk,
		name,
		namespaceVariableName,
		reexports
	} of dependencies) {
		if (!isChunk) {
			const moduleInterop = String(interop(id));
			let hasDefault = false;
			let hasNamespace = false;
			for (const { imported, reexported } of [
				...(imports || []),
				...(reexports || [])
			] as ReexportSpecifier[]) {
				let helper: string | null = null;
				let variableName;
				if (imported === 'default') {
					if (!hasDefault) {
						hasDefault = true;
						helper = defaultInteropHelpersByInteropType[moduleInterop];
						variableName = defaultVariableName;
					}
				} else if (imported === '*' && reexported !== '*') {
					if (!hasNamespace) {
						hasNamespace = true;
						helper = namespaceInteropHelpersByInteropType[moduleInterop];
						variableName = namespaceVariableName;
					}
				}
				if (helper) {
					neededInteropHelpers.add(helper);
					interopStatements.push(
						`${varOrConst} ${variableName}${_}=${_}/*#__PURE__*/${helper}(${name});`
					);
				}
			}
		}
	}
	return `${getHelpersBlock(
		neededInteropHelpers,
		accessedGlobals,
		_,
		n,
		s,
		t,
		externalLiveBindings,
		freeze
	)}${interopStatements.length > 0 ? `${interopStatements.join(n)}${n}${n}` : ''}`;
}
