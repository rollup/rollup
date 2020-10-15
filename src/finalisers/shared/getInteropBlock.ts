import { ModuleDeclarationDependency, ReexportSpecifier } from '../../Chunk';
import { GetInterop } from '../../rollup/types';
import {
	defaultInteropHelpersByInteropType,
	getDefaultOnlyHelper,
	getHelpersBlock,
	namespaceInteropHelpersByInteropType
} from '../../utils/interopHelpers';

export default function getInteropBlock(
	dependencies: ModuleDeclarationDependency[],
	varOrConst: string,
	interop: GetInterop,
	externalLiveBindings: boolean,
	freeze: boolean,
	namespaceToStringTag: boolean,
	accessedGlobals: Set<string>,
	_: string,
	n: string,
	s: string,
	t: string
): string {
	const neededInteropHelpers = new Set<string>();
	const interopStatements: string[] = [];
	const addInteropStatement = (
		helperVariableName: string,
		helper: string,
		dependencyVariableName: string
	): void => {
		neededInteropHelpers.add(helper);
		interopStatements.push(
			`${varOrConst} ${helperVariableName}${_}=${_}/*#__PURE__*/${helper}(${dependencyVariableName});`
		);
	};
	for (const {
		defaultVariableName,
		imports,
		id,
		isChunk,
		name,
		namedExportsMode,
		namespaceVariableName,
		reexports
	} of dependencies) {
		if (isChunk) {
			for (const { imported, reexported } of [
				...(imports || []),
				...(reexports || [])
			] as ReexportSpecifier[]) {
				if (imported === '*' && reexported !== '*') {
					if (!namedExportsMode) {
						addInteropStatement(namespaceVariableName!, getDefaultOnlyHelper(), name);
					}
					break;
				}
			}
		} else {
			const moduleInterop = String(interop(id));
			let hasDefault = false;
			let hasNamespace = false;
			for (const { imported, reexported } of [
				...(imports || []),
				...(reexports || [])
			] as ReexportSpecifier[]) {
				let helper: string | undefined | null;
				let variableName: string | undefined;
				if (imported === 'default') {
					if (!hasDefault) {
						hasDefault = true;
						if (defaultVariableName !== namespaceVariableName) {
							variableName = defaultVariableName!;
							helper = defaultInteropHelpersByInteropType[moduleInterop];
						}
					}
				} else if (imported === '*' && reexported !== '*') {
					if (!hasNamespace) {
						hasNamespace = true;
						helper = namespaceInteropHelpersByInteropType[moduleInterop];
						variableName = namespaceVariableName!;
					}
				}
				if (helper) {
					addInteropStatement(variableName!, helper, name);
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
		freeze,
		namespaceToStringTag
	)}${interopStatements.length > 0 ? `${interopStatements.join(n)}${n}${n}` : ''}`;
}
