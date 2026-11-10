import { AST_NODES, astNodeNamesWithFieldOrder, NODE_UNION_TYPES } from './ast-types.ts';

export const ROOT_NODE_NAMES = new Set(['PanicError', 'ParseError', 'Program']);

export interface ParentTypeInfo {
	astTypeBySchemaName: Map<string, string>;
	astTypes: string[];
	parentsByAstType: Map<string, Set<string>>;
}

export function getParentTypeInfo(): ParentTypeInfo {
	const astTypeBySchemaName = new Map<string, string>(
		astNodeNamesWithFieldOrder.map(({ name, node }) => [name, node.astType || name])
	);
	const parentsByAstType = new Map<string, Set<string>>();

	for (const { name, fields } of astNodeNamesWithFieldOrder) {
		for (const field of fields) {
			if (field.type !== 'Node' && field.type !== 'NodeList') {
				continue;
			}
			for (const childSchemaName of expandNodeTypes(field.nodeTypes)) {
				const childAstType = astTypeBySchemaName.get(childSchemaName);
				if (!childAstType) {
					throw new Error(`Unknown node: ${childSchemaName}`);
				}
				let parents = parentsByAstType.get(childAstType);
				if (!parents) {
					parents = new Set();
					parentsByAstType.set(childAstType, parents);
				}
				parents.add(name);
			}
		}
	}

	for (const [schemaName, astType] of astTypeBySchemaName) {
		if (!ROOT_NODE_NAMES.has(schemaName) && !parentsByAstType.has(astType)) {
			throw new Error(`Node ${schemaName} has no parent but is not a root node`);
		}
	}

	return {
		astTypeBySchemaName,
		astTypes: [...new Set(astTypeBySchemaName.values())].sort(),
		parentsByAstType
	};
}

function expandNodeTypes(nodeTypes: readonly string[]): string[] {
	const expanded: string[] = [];
	const pending = [...nodeTypes];
	const seenUnions = new Set<string>();
	while (pending.length > 0) {
		const nodeType = pending.pop()!;
		const unionMembers = (NODE_UNION_TYPES as Record<string, readonly string[] | undefined>)[
			nodeType
		];
		if (unionMembers) {
			if (seenUnions.has(nodeType)) {
				continue;
			}
			seenUnions.add(nodeType);
			pending.push(...unionMembers);
			continue;
		}
		if (!AST_NODES[nodeType as keyof typeof AST_NODES]) {
			throw new Error(`Unknown node: ${nodeType}`);
		}
		expanded.push(nodeType);
	}
	return expanded;
}

export function renderParentMap(
	parentTypeInfo: ParentTypeInfo,
	mapParentName: (schemaName: string) => string
): string {
	const entries = parentTypeInfo.astTypes.map(astType => {
		const parents = [
			...new Set([...(parentTypeInfo.parentsByAstType.get(astType) ?? [])].map(mapParentName))
		].sort();
		return `\t${astType}: ${parents.length > 0 ? parents.join(' | ') : 'never'};`;
	});
	return `interface ParentMap {\n${entries.join('\n')}\n}`;
}

export function renderParentOf(): string {
	return "export type ParentOf<T extends AstNode> = ParentMap[Extract<T['type'], keyof ParentMap>];";
}
