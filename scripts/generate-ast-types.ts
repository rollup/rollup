import { writeFile } from 'node:fs/promises';
import type { AstNodeName, AstUnionName, FieldDescription, NodeDescription } from './ast-types.ts';
import { astNodeNamesWithFieldOrder, getAstTypeName, NODE_UNION_TYPES } from './ast-types.ts';
import { generateNotEditFilesComment, lintTsFile } from './helpers.ts';
import {
	getParentTypeInfo,
	renderNodesWithUnionFieldAliases,
	renderParentMap,
	renderParentOf,
	ROOT_NODE_NAMES
} from './parent-types.ts';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const astTypesFile = new URL('../src/rollup/ast-types.d.ts', import.meta.url);

const getEagerNodeTypeReference = (nodeType: string) => nodeType;

const getLazyNodeTypeReference = (nodeType: string) =>
	NODE_UNION_TYPES[nodeType as AstUnionName] ? `LazyNode<${nodeType}>` : `Lazy${nodeType}`;

function getFieldType(
	field: FieldDescription,
	node: NodeDescription,
	getNodeTypeReference: (nodeType: string) => string
): string {
	switch (field.type) {
		case 'Node': {
			const baseType = field.nodeTypes.map(getNodeTypeReference).join(' | ');
			return field.allowNull && !node.optionalFallback?.[field.name]
				? `${baseType} | null`
				: baseType;
		}
		case 'NodeList': {
			const baseTypes: string[] = field.nodeTypes.map(getNodeTypeReference);
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

function getNodeFields(
	node: NodeDescription,
	nodeFields: FieldDescription[],
	getNodeTypeReference: (nodeType: string) => string
): string[] {
	const flags = node.flags?.map(flag => `${flag}: boolean;`) || [];
	const fields = nodeFields
		.filter(field => !node.serializeHiddenFields?.[field.name])
		.map(
			field =>
				`${field.name}${isOptional(field) ? '?' : ''}: ${getFieldType(field, node, getNodeTypeReference)};`
		);
	const additionalFields = Object.entries(node.additionalFields || {}).map(
		([name, { type }]) => `${name}: ${type};`
	);
	const fixedFields = Object.entries(node.fixed || {}).map(([name, type]) => `${name}: ${type};`);
	return [...fields, ...additionalFields, ...fixedFields, ...flags];
}

function getNodeType(
	name: AstNodeName,
	node: NodeDescription,
	nodeFields: FieldDescription[]
): string {
	const fields = getNodeFields(node, nodeFields, getEagerNodeTypeReference);
	return `export interface ${name} extends BaseNode {
  type: '${getAstTypeName(name)}';${fields.map(field => `\n  ${field}`).join('')}
}`;
}

function getLazyNodeType(
	name: AstNodeName,
	node: NodeDescription,
	nodeFields: FieldDescription[]
): string {
	const fields = getNodeFields(node, nodeFields, getLazyNodeTypeReference);
	const parent = ROOT_NODE_NAMES.has(name) ? 'null' : `LazyNode<ParentOf<${name}>> | null`;
	return `export interface Lazy${name} extends BaseNode {
  type: '${getAstTypeName(name)}';${[...fields, `parent: ${parent};`].map(field => `\n  ${field}`).join('')}
}`;
}

const parentTypeInfo = getParentTypeInfo();
const nodesWithUnionFieldAliases = renderNodesWithUnionFieldAliases(
	parentTypeInfo,
	schemaName => schemaName
);
const parentMap = renderParentMap(parentTypeInfo, schemaName => schemaName);
const parentOf = renderParentOf();

const schemaNamesByAstType = new Map<string, string[]>();
for (const { name } of astNodeNamesWithFieldOrder) {
	const astType = getAstTypeName(name);
	const schemaNames = schemaNamesByAstType.get(astType);
	if (schemaNames) {
		schemaNames.push(name);
	} else {
		schemaNamesByAstType.set(astType, [name]);
	}
}

const lazyNodeMap = `interface LazyNodeMap {${[...schemaNamesByAstType]
	.map(
		([astType, schemaNames]) =>
			`\n\t${astType}: ${schemaNames.map(name => `Lazy${name}`).join(' | ')};`
	)
	.join('')}
}`;

const astTypes = `${notEditFilesComment}

export interface BaseNode {
  end: number;
  start: number;
}

export type AnnotationType = 'pure' | 'noSideEffects';

interface Annotation extends BaseNode {
	type: AnnotationType;
}

${astNodeNamesWithFieldOrder.map(({ name, node, fields }) => getNodeType(name, node, fields)).join('\n\n')}

${Object.entries(NODE_UNION_TYPES)
	.map(([name, fields]) => `export type ${name} = ${fields.join(' | ')};`)
	.join('\n\n')}

export type AstNode = ${astNodeNamesWithFieldOrder.map(({ name }) => `${name}`).join(' | ')};

${nodesWithUnionFieldAliases}

/**
 * The possible parents of a node, keyed by AST node type.
 */
${parentMap}

/**
 * The union of node types that can contain a \`T\`.
 */
${parentOf}

${astNodeNamesWithFieldOrder.map(({ name, node, fields }) => getLazyNodeType(name, node, fields)).join('\n\n')}

${lazyNodeMap}

/**
 * A lazy AST node with a required parent link. Root nodes have \`parent === null\`.
 */
export type LazyNode<T extends AstNode = AstNode> = T extends AstNode
	? LazyNodeMap[Extract<T['type'], keyof LazyNodeMap>]
	: never;

export interface AstNodeTypeMap {${[...schemaNamesByAstType]
	.map(([astType, schemaNames]) => `\n\t'${astType}': ${schemaNames.join(' | ')};`)
	.join('')}
}
`;

await writeFile(astTypesFile, astTypes);
await lintTsFile(astTypesFile);
