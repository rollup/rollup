import { writeFile } from 'node:fs/promises';
import type { FieldDescription, NodeDescription } from './ast-types.ts';
import { astNodeNamesWithFieldOrder, NODE_UNION_TYPES } from './ast-types.ts';
import { generateNotEditFilesComment, lintTsFile } from './helpers.ts';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const astTypesFile = new URL('../src/rollup/ast-types.d.ts', import.meta.url);

function getFieldType(field: FieldDescription, node: NodeDescription): string {
	switch (field.type) {
		case 'Node': {
			const baseType = field.nodeTypes.join(' | ');
			return field.allowNull && !node.optionalFallback?.[field.name]
				? `${baseType} | null`
				: baseType;
		}
		case 'NodeList': {
			const baseTypes: string[] = [...field.nodeTypes];
			if (field.allowNull) {
				baseTypes.push('null');
			}
			let baseType = baseTypes.join(' | ');
			if (baseTypes.length > 1) {
				baseType = `(${baseType})`;
			}
			return `readonly ${baseType}[]`;
		}
		case 'String':
			return 'string';
		case 'Annotations':
			return 'readonly Annotation[]';
		case 'Float':
			return 'number';
		case 'ScopeOffset':
			return 'never';
		case 'FixedString':
			return field.values.map(value => `'${value}'`).join(' | ');
		default:
			throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
	}
}

function isOptional(field: FieldDescription): boolean {
	switch (field.type) {
		case 'Node':
		case 'NodeList':
		case 'Float': {
			return false;
		}
		case 'ScopeOffset': {
			return false;
		}
		case 'FixedString':
		case 'String':
			return !!field.optional;
		case 'Annotations':
			return true;
		default:
			throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
	}
}

function getNodeType(name: string, node: NodeDescription, nodeFields: FieldDescription[]): string {
	const flags = node.flags?.map(flag => `${flag}: boolean;`);
	const fields = nodeFields
		?.filter(field => !node.serializeHiddenFields?.[field.name])
		.map(field => `${field.name}${isOptional(field) ? '?' : ''}: ${getFieldType(field, node)};`);
	const additionalFields = Object.entries(node.additionalFields || {}).map(
		([name, { type }]) => `${name}: ${type};`
	);
	const fixedFields = Object.entries(node.fixed || {}).map(([name, type]) => `${name}: ${type};`);
	return `export interface ${name} extends AstNodeBase {
  type: '${node.astType || name}';${[...(fields || []), ...additionalFields, ...fixedFields, ...(flags || [])].map(field => `\n  ${field}`).join('')}
}`;
}

const ROOT_NODE_NAMES = new Set(['PanicError', 'ParseError', 'Program']);

function expandNodeTypes(nodeTypes: readonly string[]): string[] {
	const expanded: string[] = [];
	const pending = [...nodeTypes];
	while (pending.length > 0) {
		const nodeType = pending.pop()!;
		const unionMembers = (NODE_UNION_TYPES as Record<string, string[] | undefined>)[nodeType];
		if (unionMembers) {
			pending.push(...unionMembers);
		} else {
			expanded.push(nodeType);
		}
	}
	return expanded;
}

const nodeDescriptions = new Map<string, NodeDescription>(
	astNodeNamesWithFieldOrder.map(({ name, node }) => [name, node])
);

const astTypeParentNames = new Map<string, Set<string>>();
for (const { name, fields } of astNodeNamesWithFieldOrder) {
	for (const field of fields) {
		if (field.type !== 'Node' && field.type !== 'NodeList') {
			continue;
		}
		for (const childName of expandNodeTypes(field.nodeTypes)) {
			const childNode = nodeDescriptions.get(childName);
			const childAstType = childNode ? childNode.astType || childName : childName;
			const parents = astTypeParentNames.get(childAstType);
			if (parents) {
				parents.add(name);
			} else {
				astTypeParentNames.set(childAstType, new Set([name]));
			}
		}
	}
}

for (const { name, node } of astNodeNamesWithFieldOrder) {
	const astType = node.astType || name;
	if (!ROOT_NODE_NAMES.has(name) && !astTypeParentNames.has(astType)) {
		throw new Error(`Node ${name} has no parent but is not a root node`);
	}
}

const parentAstTypes = [
	...new Set(astNodeNamesWithFieldOrder.map(({ name, node }) => node.astType || name))
].sort();

const astTypeBySchemaName = new Map<string, string>(
	astNodeNamesWithFieldOrder.map(({ name, node }) => [name, node.astType || name])
);

const unionTypes = new Set(Object.keys(NODE_UNION_TYPES));
const astTypeNames = new Set(parentAstTypes);

const astTypesByUnionType = new Map();
for (const [unionType, members] of Object.entries(NODE_UNION_TYPES)) {
	const astTypes = new Set();
	for (const member of members) {
		if (unionTypes.has(member)) {
			astTypes.add(member);
			continue;
		}
		const astType = astTypeBySchemaName.get(member);
		if (!astType) {
			throw new Error(`Unknown node: ${member}`);
		}
		astTypes.add(astType);
	}
	astTypesByUnionType.set(unionType, [...astTypes]);
}

const parentsByFieldType = new Map();
for (const { name, fields, node } of astNodeNamesWithFieldOrder) {
	const parentAstType = node.astType || name;
	for (const field of fields) {
		if (field.type !== 'Node' && field.type !== 'NodeList') {
			continue;
		}
		for (const fieldTypeName of field.nodeTypes) {
			const parents = parentsByFieldType.get(fieldTypeName);
			if (parents) {
				parents.add(parentAstType);
			} else {
				parentsByFieldType.set(fieldTypeName, new Set([parentAstType]));
			}
		}
	}
}

const explicitParentsByAstType = new Map();
for (const [schemaName, astType] of astTypeBySchemaName) {
	const parents = new Set(explicitParentsByAstType.get(astType) ?? []);
	for (const parent of parentsByFieldType.get(schemaName) ?? []) {
		parents.add(parent);
	}
	for (const parent of parentsByFieldType.get(astType) ?? []) {
		parents.add(parent);
	}
	explicitParentsByAstType.set(astType, parents);
}

const unionsByAstType = new Map();
for (const [unionType, members] of astTypesByUnionType) {
	for (const member of members) {
		if (member === unionType) {
			continue;
		}
		const unions = unionsByAstType.get(member);
		if (unions) {
			unions.add(unionType);
		} else {
			unionsByAstType.set(member, new Set([unionType]));
		}
	}
}

const normalizedParentsByUnion = new Map();
for (const unionType of unionTypes) {
	const includedUnions = new Set([unionType]);
	for (const includedUnion of includedUnions) {
		for (const parentUnion of unionsByAstType.get(includedUnion) ?? []) {
			includedUnions.add(parentUnion);
		}
	}
	const parents = new Set();
	for (const includedUnion of includedUnions) {
		for (const parent of parentsByFieldType.get(includedUnion) ?? []) {
			parents.add(parent);
		}
	}
	normalizedParentsByUnion.set(unionType, parents);
}

const usedUnionNames = new Set();
const parentTypeAliases = [];
for (const astType of parentAstTypes) {
	const unions = [...(unionsByAstType.get(astType) ?? [])]
		.filter(unionType => !astTypeNames.has(unionType))
		.sort();
	const coveredParents = new Set();
	for (const unionType of unions) {
		for (const parent of normalizedParentsByUnion.get(unionType)) {
			coveredParents.add(parent);
		}
	}
	const remainingParents = [...(explicitParentsByAstType.get(astType) ?? [])]
		.filter(parent => !coveredParents.has(parent))
		.sort();
	const composedParents = new Set([...coveredParents, ...remainingParents]);
	const expectedParents = new Set(
		[...(astTypeParentNames.get(astType) ?? [])].map(name => astTypeBySchemaName.get(name) ?? name)
	);
	if (
		composedParents.size !== expectedParents.size ||
		[...composedParents].some(parent => !expectedParents.has(parent))
	) {
		throw new Error(
			`Parent types for ${astType} are not equivalent: missing ${[...expectedParents].filter(p => !composedParents.has(p)).join(',')} extra ${[...composedParents].filter(p => !expectedParents.has(p)).join(',')}`
		);
	}
	const unionReferences = unions.map(unionType => {
		usedUnionNames.add(unionType);
		return `${unionType}Parent`;
	});
	const parts = [...unionReferences, ...remainingParents];
	parentTypeAliases.push(
		`export type ${astType}Parent = ${parts.length > 0 ? parts.join(' | ') : 'never'};`
	);
}

const unionTypeAliases = [...usedUnionNames]
	.sort()
	.map(
		unionName =>
			`export type ${unionName}Parent = ${[...normalizedParentsByUnion.get(unionName)].sort().join(' | ')};`
	);

const parentTypes = [...unionTypeAliases, ...parentTypeAliases].join('\n');

const parentMap = `export interface ParentMap {\n${parentAstTypes
	.map(astType => `  ${astType}: ${astType}Parent;`)
	.join('\n')}\n}`;

const astTypes = `${notEditFilesComment}

export interface BaseNode {
  end: number;
  start: number;
}

/**
 * Base of every AST node. Lazy AST nodes add a \`parent\` link on top of this
 * shape via {@link WithParent}; eager AST nodes never have one.
 */
export type AstNodeBase = BaseNode;

export type AnnotationType = 'pure' | 'noSideEffects';

interface Annotation extends BaseNode {
	type: AnnotationType;
}

${astNodeNamesWithFieldOrder.map(({ name, node, fields }) => getNodeType(name, node, fields)).join('\n\n')}

${Object.entries(NODE_UNION_TYPES)
	.map(([name, fields]) => `export type ${name} = ${fields.join(' | ')};`)
	.join('\n\n')}

export type AstNode = ${astNodeNamesWithFieldOrder.map(({ name }) => `${name}`).join(' | ')};

${parentTypes}

${parentMap}

/**
 * The possible parents of a node, derived from the field definitions of all
 * node types.
 */
export type ParentOf<T extends AstNode> = Extract<ParentMap[Extract<T['type'], keyof ParentMap>], AstNode>;

/**
 * A lazy AST node with a precise parent link. The root node of a parse has
 * \`parent === null\`, so the link is optional and the chain can be followed
 * with optional chaining.
 */
type WithParentValue<Value> = Value extends AstNode
	? WithParent<Value>
	: Value extends readonly (infer Element)[]
		? Element extends AstNode
			? readonly WithParentValue<Element>[]
			: Value
		: Value;

export type WithParent<T extends AstNode = AstNode> = T extends AstNode
	? T & {
			parent?: WithParent<ParentOf<T>> | null;
		} & {
			[K in keyof T]: WithParentValue<T[K]>;
		}
	: never;

export type LazyNode<T extends AstNode = AstNode> = WithParent<T>;

export interface AstNodeTypeMap {${(() => {
	const typeMap = new Map<string, string[]>();
	for (const { name, node } of astNodeNamesWithFieldOrder) {
		const astType = node.astType || name;
		if (!typeMap.has(astType)) {
			typeMap.set(astType, []);
		}
		typeMap.get(astType)!.push(name);
	}
	return Array.from(typeMap.entries())
		.map(([astType, names]) => `\n\t'${astType}': ${names.join(' | ')};`)
		.join('');
})()}
}
`;

await writeFile(astTypesFile, astTypes);
await lintTsFile(astTypesFile);
