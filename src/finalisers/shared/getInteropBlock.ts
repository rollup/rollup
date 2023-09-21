import type { ChunkDependency, ReexportSpecifier } from '../../Chunk';
import type { GetInterop } from '../../rollup/types';
import type { GenerateCodeSnippets } from '../../utils/generateCodeSnippets';
import {
	defaultInteropHelpersByInteropType,
	getHelpersBlock,
	INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE,
	namespaceInteropHelpersByInteropType
} from '../../utils/interopHelpers';

export default function getInteropBlock(
	dependencies: readonly ChunkDependency[],
	interop: GetInterop,
	externalLiveBindings: boolean,
	freeze: boolean,
	symbols: boolean,
	accessedGlobals: Set<string>,
	indent: string,
	snippets: GenerateCodeSnippets
): string {
	const { _, cnst, n } = snippets;
	const neededInteropHelpers = new Set<string>();
	const interopStatements: string[] = [];
	const addInteropStatement = (
		helperVariableName: string,
		helper: string,
		dependencyVariableName: string
	): void => {
		neededInteropHelpers.add(helper);
		interopStatements.push(
			`${cnst} ${helperVariableName}${_}=${_}/*#__PURE__*/${helper}(${dependencyVariableName});`
		);
	};
	for (const {
		defaultVariableName,
		imports,
		importPath,
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
						addInteropStatement(
							namespaceVariableName!,
							INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE,
							name
						);
					}
					break;
				}
			}
		} else {
			const moduleInterop = interop(importPath);
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
				} else if (imported === '*' && reexported !== '*' && !hasNamespace) {
					hasNamespace = true;
					helper = namespaceInteropHelpersByInteropType[moduleInterop];
					variableName = namespaceVariableName!;
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
		indent,
		snippets,
		externalLiveBindings,
		freeze,
		symbols
	)}${interopStatements.length > 0 ? `${interopStatements.join(n)}${n}${n}` : ''}`;
}
