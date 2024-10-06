import { writeFile } from 'node:fs/promises';
import type { FieldDescription, NodeDescription } from './ast-types.js';
import { astNodeNamesWithFieldOrder, NODE_UNION_TYPES } from './ast-types.js';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const astTypesFile = new URL('../src/rollup/ast-types.d.ts', import.meta.url);

function getFieldType(field: FieldDescription): string {
	switch (field.type) {
		case 'Node': {
			const baseType = field.nodeTypes.join(' | ');
			return field.allowNull ? `${baseType} | null` : baseType;
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
		case 'Float':
		case 'FixedString': {
			return false;
		}
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
		?.filter(field => !node.hiddenFields?.includes(field.name))
		.map(field => `${field.name}${isOptional(field) ? '?' : ''}: ${getFieldType(field)};`);
	const additionalFields = Object.entries(node.additionalFields || {}).map(
		([name, { type }]) => `${name}: ${type};`
	);
	const fixedFields = Object.entries(node.fixed || {}).map(([name, type]) => `${name}: ${type};`);
	return `export interface ${name} extends BaseNode {
  type: '${node.astType || name}';${[...(fields || []), ...additionalFields, ...fixedFields, ...(flags || [])].map(field => `\n  ${field}`).join('')}
}`;
}

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
`;

await writeFile(astTypesFile, astTypes);
await lintTsFile(astTypesFile);
