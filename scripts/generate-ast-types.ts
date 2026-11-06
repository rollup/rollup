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

const nodeParentNames = new Map<string, Set<string>>();
for (const { name, fields } of astNodeNamesWithFieldOrder) {
	for (const field of fields) {
		if (field.type !== 'Node' && field.type !== 'NodeList') {
			continue;
		}
		for (const childName of expandNodeTypes(field.nodeTypes)) {
			if (childName === name) {
				continue;
			}
			const parents = nodeParentNames.get(childName);
			if (parents) {
				parents.add(name);
			} else {
				nodeParentNames.set(childName, new Set([name]));
			}
		}
	}
}

for (const { name } of astNodeNamesWithFieldOrder) {
	if (!ROOT_NODE_NAMES.has(name) && !nodeParentNames.has(name)) {
		throw new Error(`Node ${name} has no parent but is not a root node`);
	}
}

const parentTypes = astNodeNamesWithFieldOrder
	.map(({ name }) => {
		const parents = nodeParentNames.get(name);
		return `export type ${name}Parent = ${parents ? [...parents].sort().join(' | ') : 'never'};`;
	})
	.join('\n');

const parentMap = `export interface ParentMap {\n${astNodeNamesWithFieldOrder
	.map(({ name }) => `  ${name}: ${name}Parent;`)
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
export type ParentOf<T extends AstNode> = ParentMap[Extract<T['type'], keyof ParentMap>] & AstNode;

/**
 * A lazy AST node with a precise parent link. The root node of a parse has
 * \`parent === null\`, so the link is optional and the chain can be followed
 * with optional chaining.
 */
export type WithParent<T extends AstNode = AstNode> = T extends AstNode
	? T & { parent?: WithParent<ParentOf<T>> | null } & {
			[K in keyof T]: T[K] extends AstNode
				? WithParent<T[K]>
				: T[K] extends readonly (infer Element)[]
					? Element extends AstNode
						? readonly WithParent<Element>[]
						: T[K]
					: T[K];
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
