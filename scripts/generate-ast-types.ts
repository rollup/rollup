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
  type: '${node.astType || name}';
  parent?: AstNode | null;${[...(fields || []), ...additionalFields, ...fixedFields, ...(flags || [])].map(field => `\n  ${field}`).join('')}
}`;
}

const astTypes = `${notEditFilesComment}

export interface BaseNode {
  end: number;
  start: number;
}

/**
 * Base of every AST node. \`parent\` is only present on nodes from lazy ASTs,
 * where it is resolved on first access: \`null\` for the root and absent on
 * eager ASTs, so \`'parent' in node\` distinguishes the two.
 */
export interface AstNodeBase extends BaseNode {
  parent?: AstNode | null;
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

/**
 * A lazy AST node whose \`parent\` is present at runtime. The root node of a
 * parse can still have \`parent === null\`, so the parent chain stays optional.
 */
export type LazyNode<T extends AstNode = AstNode> = T extends unknown
	? T & { parent: Exclude<T['parent'], undefined> }
	: never;

/**
 * The shape of an eager AST node, which never has a \`parent\` property.
 */
export type EagerNode<T extends AstNode = AstNode> = T extends unknown ? Omit<T, 'parent'> : never;

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
