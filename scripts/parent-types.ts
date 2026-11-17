import type { AstNodeName, AstUnionName } from './ast-types.ts';
import {
	AST_NODES,
	astNodeNamesWithFieldOrder,
	getAstTypeName,
	NODE_UNION_TYPES
} from './ast-types.ts';

export const ROOT_NODE_NAMES = new Set(['PanicError', 'ParseError', 'Program']);

interface ParentReferences {
	schemaNames: Set<string>;
	unionNames: Set<string>;
}

export interface ParentTypeInfo {
	astTypes: string[];
	parentReferencesByAstType: Map<string, ParentReferences>;
	parentSchemaNamesByUnion: Map<string, Set<string>>;
}

export function getParentTypeInfo(): ParentTypeInfo {
	const parentReferencesByAstType = new Map<string, ParentReferences>();
	const parentSchemaNamesByUnion = new Map<string, Set<string>>();

	const getReferences = (astType: string): ParentReferences => {
		let references = parentReferencesByAstType.get(astType);
		if (!references) {
			references = { schemaNames: new Set(), unionNames: new Set() };
			parentReferencesByAstType.set(astType, references);
		}
		return references;
	};

	const getUnionParentSchemaNames = (unionName: AstUnionName): Set<string> => {
		let parentSchemaNames = parentSchemaNamesByUnion.get(unionName);
		if (!parentSchemaNames) {
			parentSchemaNames = new Set();
			parentSchemaNamesByUnion.set(unionName, parentSchemaNames);
		}
		return parentSchemaNames;
	};

	for (const { name, fields } of astNodeNamesWithFieldOrder) {
		for (const field of fields) {
			if (field.type !== 'Node' && field.type !== 'NodeList') {
				continue;
			}
			for (const nodeType of field.nodeTypes) {
				if (NODE_UNION_TYPES[nodeType as AstUnionName]) {
					const unionName = nodeType as AstUnionName;
					getUnionParentSchemaNames(unionName).add(name);
					for (const childName of expandNodeTypes(unionName)) {
						getReferences(getAstTypeName(childName)).unionNames.add(unionName);
					}
				} else {
					getReferences(getAstTypeName(nodeType)).schemaNames.add(name);
				}
			}
		}
	}

	const astTypes = [
		...new Set(astNodeNamesWithFieldOrder.map(({ name }) => getAstTypeName(name)))
	].sort();

	for (const { name: schemaName } of astNodeNamesWithFieldOrder) {
		if (
			!ROOT_NODE_NAMES.has(schemaName) &&
			!parentReferencesByAstType.has(getAstTypeName(schemaName))
		) {
			throw new Error(`Node ${schemaName} has no parent but is not a root node`);
		}
	}

	return { astTypes, parentReferencesByAstType, parentSchemaNamesByUnion };
}

function expandNodeTypes(unionName: AstUnionName): AstNodeName[] {
	const expanded: AstNodeName[] = [];
	const pending = [...NODE_UNION_TYPES[unionName]];
	const seenUnions = new Set<AstUnionName>([unionName]);
	while (pending.length > 0) {
		const nodeType = pending.pop()!;
		const unionMembers = NODE_UNION_TYPES[nodeType as AstUnionName];
		if (unionMembers) {
			if (seenUnions.has(nodeType as AstUnionName)) {
				continue;
			}
			seenUnions.add(nodeType as AstUnionName);
			pending.push(...unionMembers);
			continue;
		}
		if (!AST_NODES[nodeType as AstNodeName]) {
			throw new Error(`Unknown node: ${nodeType}`);
		}
		expanded.push(nodeType as AstNodeName);
	}
	return expanded;
}

export function renderNodesWithUnionFieldAliases(
	parentTypeInfo: ParentTypeInfo,
	mapParentName: (schemaName: string) => string
): string {
	return [...parentTypeInfo.parentSchemaNamesByUnion.keys()]
		.sort()
		.map(unionName => {
			const parentNames = [
				...new Set([...parentTypeInfo.parentSchemaNamesByUnion.get(unionName)!].map(mapParentName))
			].sort();
			return `type NodesWith${unionName}Field = ${parentNames.join(' | ')};`;
		})
		.join('\n');
}

export function renderParentMap(
	parentTypeInfo: ParentTypeInfo,
	mapParentName: (schemaName: string) => string
): string {
	const entries = parentTypeInfo.astTypes.map(astType => {
		const references = parentTypeInfo.parentReferencesByAstType.get(astType);
		const parentTypes = [
			...[...(references?.unionNames ?? [])].sort().map(unionName => `NodesWith${unionName}Field`),
			...[...new Set([...(references?.schemaNames ?? [])].map(mapParentName))].sort()
		];
		return `\t${astType}: ${parentTypes.length > 0 ? parentTypes.join(' | ') : 'never'};`;
	});
	return `interface ParentMap {\n${entries.join('\n')}\n}`;
}

export function renderParentOf(): string {
	return "export type ParentOf<T extends AstNode> = ParentMap[Extract<T['type'], keyof ParentMap>];";
}
