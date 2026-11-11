import { writeFile } from 'node:fs/promises';
import type { AstNodeName, FieldDescription, NodeDescription } from './ast-types.ts';
import { astNodeNamesWithFieldOrder } from './ast-types.ts';
import {
	ENCODED_PARENT_BIAS,
	getFirstFieldWordOffset,
	NODE_DATA_OFFSET,
	NODE_END_OFFSET,
	NODE_PARENT_OFFSET,
	NODE_START_OFFSET
} from './buffer-layout.ts';
import { generateNotEditFilesComment, lintTsFile } from './helpers.ts';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const bufferToJsAstFile = new URL('../src/utils/bufferToLazyAst.ts', import.meta.url);

const eagerStringFields: Partial<Record<AstNodeName, string>> = {
	Identifier: 'name',
	JSXIdentifier: 'name',
	PrivateIdentifier: 'name'
};

const memoisedAdditionalFields = new Set([
	'LiteralRegExp.regex',
	'LiteralRegExp.value',
	'TemplateElement.value'
]);

for (const [nodeName, fieldName] of Object.entries(eagerStringFields)) {
	const node = astNodeNamesWithFieldOrder.find(({ name }) => name === nodeName)?.node;
	if (!node?.fields?.some(field => field.name === fieldName && field.type === 'String')) {
		throw new Error(
			`The eager string field ${nodeName}.${fieldName} is not a String field of that node`
		);
	}
}

for (const field of memoisedAdditionalFields) {
	const [nodeName, fieldName] = field.split('.');
	const node = astNodeNamesWithFieldOrder.find(({ name }) => name === nodeName)?.node;
	if (!node || !(fieldName in (node.additionalFields ?? {}))) {
		throw new Error(`The memoised field ${field} is not an additional field of that node`);
	}
}

function getOffset(node: NodeDescription): number {
	return getFirstFieldWordOffset(Boolean(node.flags));
}

function isEagerScalar(nodeName: AstNodeName, field: FieldDescription): boolean {
	return (
		field.type === 'FixedString' ||
		(field.type === 'String' && eagerStringFields[nodeName] === field.name)
	);
}

const prototypeDeclarations = astNodeNamesWithFieldOrder.map(({ name, fields, node }) => {
	const offset = getOffset(node);
	const getters: string[] = [
		`type: '${node.astType || name}'`,
		...fields
			.map((field, index) => getFieldGetter(name, field, node, index + offset))
			.filter((getter): getter is string => !!getter),
		...getAdditionalFieldGetters(name, node, fields),
		...Object.entries(node.fixed || {}).map(([key, value]) => `${key}: ${value}`)
	];
	return `const ${name}Prototype: object = {
	${getters.join(',\n\t')}
};
/* The parent must not be enumerable as that would make for..in based
   walkers like estree-walker traverse it into cycles. */
Object.defineProperty(${name}Prototype, 'parent', {
	get() {
		const buffer = (this as any)[BUFFER] as AstBuffer;
		const parentPosition = buffer[getPosition(this) + ${NODE_PARENT_OFFSET}];
		return parentPosition === 0
			? null
			: convertNode(parentPosition - ${ENCODED_PARENT_BIAS}, buffer);
	}
});`;
});

const nodeFactories = astNodeNamesWithFieldOrder.map(({ name, fields, node }) => {
	const offset = getOffset(node);
	const assignments: string[] = [];
	if (node.flags) {
		assignments.push(`const flags = buffer[position + ${NODE_DATA_OFFSET}];`);
		for (const [index, flag] of node.flags.entries()) {
			assignments.push(`node.${flag} = (flags & ${1 << index}) === ${1 << index};`);
		}
	}
	for (const [index, field] of fields.entries()) {
		if (isEagerScalar(name, field)) {
			assignments.push(
				`node.${field.name} = ${getFieldExpression(field, node, index + offset, 'position')};`
			);
		}
	}
	return `function create${name}(position: number, buffer: AstBuffer, prototype: object): ast.LazyNode<ast.${name}> {
	const node: any = Object.create(prototype);
	node[POSITION] = position;
	node[BUFFER] = buffer;
	node.start = buffer[position + ${NODE_START_OFFSET}];
	node.end = buffer[position + ${NODE_END_OFFSET}];
	${assignments.length > 0 ? `${assignments.join('\n\t')}\n\t` : ''}return node;
}`;
});

function getFieldGetter(
	nodeName: AstNodeName,
	field: FieldDescription,
	node: NodeDescription,
	offset: number
): string {
	if (
		node.serializeHiddenFields?.[field.name] ||
		field.type === 'ScopeOffset' ||
		isEagerScalar(nodeName, field)
	) {
		return '';
	}
	if (field.type === 'Annotations') {
		return `get ${field.name}() {
		const buffer = (this as any)[BUFFER] as AstBuffer;
		const annotations = convertAnnotations(buffer[getPosition(this) + ${offset}], buffer);
		return annotations.length > 0 ? annotations : undefined;
	}`;
	}
	if (field.type === 'String' && field.optional) {
		return `get ${field.name}() {
		const buffer = (this as any)[BUFFER] as AstBuffer;
		const position = getPosition(this) + ${offset};
		return buffer[position] === 0 ? undefined : buffer.convertString(buffer[position]);
	}`;
	}
	const expression = getFieldExpression(field, node, offset, 'getPosition(this)');
	return `get ${field.name}() {
		${expression.includes('node.') ? 'const node = this as any;\n\t\t' : ''}const buffer = (this as any)[BUFFER] as AstBuffer;
		return ${expression};
	}`;
}

function getFieldExpression(
	field: FieldDescription,
	node: NodeDescription,
	offset: number,
	positionExpression: string
): string {
	const position = `${positionExpression} + ${offset}`;
	const dataPosition = `buffer[${position}]`;
	switch (field.type) {
		case 'Node': {
			if (field.allowNull) {
				const fallback = node.optionalFallback?.[field.name];
				if (fallback) {
					if (node.shorthandKey && field.name === 'key') {
						return `node.shorthand ? (node.value.type === 'AssignmentPattern' ? node.value.left : node.value) : convertNode(${dataPosition}, buffer)`;
					}
					return `${dataPosition} === 0 ? node.${fallback} : convertNode(${dataPosition}, buffer)`;
				}
				return `${dataPosition} === 0 ? null : convertNode(${dataPosition}, buffer)`;
			}
			return `convertNode(${dataPosition}, buffer)`;
		}
		case 'NodeList': {
			return `convertNodeList(${dataPosition}, buffer)`;
		}
		case 'String': {
			return field.optional
				? `${dataPosition} === 0 ? undefined : buffer.convertString(${dataPosition})`
				: `buffer.convertString(${dataPosition})`;
		}
		case 'FixedString': {
			const stringValue = `FIXED_STRINGS[${dataPosition}]`;
			return field.optional ? `${dataPosition} === 0 ? undefined : ${stringValue}` : stringValue;
		}
		case 'Float': {
			return `buffer.convertFloat64(${position})`;
		}
		default: {
			throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
		}
	}
}

function getBaseAssignment(
	base: string,
	node: NodeDescription,
	fields: FieldDescription[]
): string {
	const fieldIndex = fields.findIndex(field => field.name === base);
	if (fieldIndex >= 0) {
		return `const ${base} = ${getFieldExpression(fields[fieldIndex], node, fieldIndex + getOffset(node), 'position')};`;
	}
	const flagIndex = node.flags?.indexOf(base) ?? -1;
	if (flagIndex >= 0) {
		const mask = 1 << flagIndex;
		return `const ${base} = (buffer[position + ${NODE_DATA_OFFSET}] & ${mask}) === ${mask};`;
	}
	throw new Error(`Unknown base field "${base}"`);
}

function getAdditionalFieldGetters(
	nodeName: AstNodeName,
	node: NodeDescription,
	fields: FieldDescription[]
): string[] {
	const bases = node.baseForAdditionalFields || [];
	const baseAssignments = bases.map(base => getBaseAssignment(base, node, fields)).join('\n\t\t');
	return Object.entries(node.additionalFields || {}).map(([key, { value }]) => {
		const returnExpression = memoisedAdditionalFields.has(`${nodeName}.${key}`)
			? `getNodeValue(this as ast.AstNode, '${key}', () => (${value}))`
			: value;
		return `get ${key}() {
		${bases.length > 0 ? `const buffer = (this as any)[BUFFER] as AstBuffer;\n\t\tconst position = getPosition(this);\n\t\t${baseAssignments}\n\t\t` : ''}return ${returnExpression};
	}`;
	});
}

const bufferToJsAst = `${notEditFilesComment}
import { PanicError, ParseError } from '../ast/nodes/NodeType';
import type { ast } from '../rollup/types';
import { convertAnnotations } from './astConverterHelpers';
import { EMPTY_ARRAY } from './blank';
import FIXED_STRINGS from './convert-ast-strings';
import type { AstBuffer } from './getAstBuffer';
import { error, getRollupError, logParseError } from './logs';

/* eslint-disable sort-keys */
const POSITION: unique symbol = Symbol('rollup.ast.position');
const BUFFER: unique symbol = Symbol('rollup.ast.buffer');

function getPosition(node: unknown): number {
	return (node as { [POSITION]: number })[POSITION];
}

function getNodeValue<T>(node: ast.AstNode, key: string, createValue: () => T): T {
	const value = createValue();
	Object.defineProperty(node, key, {
		configurable: true,
		enumerable: true,
		value,
		writable: true
	});
	return value;
}

export function convertNode(position: number, buffer: AstBuffer): any {
	const cache = (buffer.lazyNodes ??= new Map());
	const cachedNode = cache.get(position);
	if (cachedNode !== undefined) {
		return cachedNode;
	}
	const nodeType = buffer[position];
	const prototype = nodePrototypes[nodeType];
	/* istanbul ignore if: This should never be executed but is a safeguard against faulty buffers */
	if (!prototype) {
		console.trace();
		throw new Error(\`Unknown node type: \${nodeType}\`);
	}
	const node = nodeFactories[nodeType](position, buffer, prototype);
	cache.set(position, node);
	return node;
}

function convertNodeList(position: number, buffer: AstBuffer): readonly any[] {
	if (position === 0) return EMPTY_ARRAY;
	const cache = (buffer.lazyLists ??= new Map());
	const cachedList = cache.get(position);
	if (cachedList !== undefined) {
		return cachedList;
	}
	const length = buffer[position];
	const list: any[] = new Array(length);
	for (let index = 0; index < length; index++) {
		const nodePosition = buffer[position + 1 + index];
		list[index] = nodePosition ? convertNode(nodePosition, buffer) : null;
	}
	cache.set(position, list);
	return list;
}

export const deserializeLazyAstBuffer = (
	buffer: AstBuffer,
	position: number
): ast.LazyNode<ast.AstNode> => {
	const node = convertNode(position, buffer);
	switch (node.type) {
		case PanicError: {
			return error(getRollupError(logParseError(node.message)));
		}
		case ParseError: {
			return error(getRollupError(logParseError(node.message, node.start)));
		}
		default: {
			return node;
		}
	}
};

${prototypeDeclarations.join('\n\n')}

const nodePrototypes: object[] = [
	${astNodeNamesWithFieldOrder.map(({ name }) => `${name}Prototype`).join(',\n\t')}
];

const nodeFactories: ((
	position: number,
	buffer: AstBuffer,
	prototype: object
) => ast.LazyNode<ast.AstNode>)[] = [
	${nodeFactories.join(',\n')}
];
`;

await writeFile(bufferToJsAstFile, bufferToJsAst);
await lintTsFile(bufferToJsAstFile);
