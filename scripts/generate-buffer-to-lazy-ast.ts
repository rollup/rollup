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

interface NodeClass {
	className: string;
	code: string;
	nodeType: number;
}

const nodeClasses = astNodeNamesWithFieldOrder.map(
	({ name, fields, node }, nodeType): NodeClass => {
		const className = `Lazy${name}`;
		return { className, code: getNodeClass(className, name, fields, node), nodeType };
	}
);

function getNodeClass(
	className: string,
	name: AstNodeName,
	fields: FieldDescription[],
	node: NodeDescription
): string {
	const offset = getOffset(node);
	const declarations = [
		`declare type: '${node.astType || name}';`,
		'declare start: number;',
		'declare end: number;',
		...Object.entries(node.fixed || {}).map(([key, value]) => `declare ${key}: ${value};`)
	];
	const constructorBody = [
		'this.#position = position;',
		'this.#buffer = buffer;',
		`this.start = buffer[position + ${NODE_START_OFFSET}];`,
		`this.end = buffer[position + ${NODE_END_OFFSET}];`
	];
	if (node.flags) {
		constructorBody.push(`const flags = buffer[position + ${NODE_DATA_OFFSET}];`);
		for (const [index, flag] of node.flags.entries()) {
			const mask = 1 << index;
			declarations.push(`declare ${flag}: boolean;`);
			constructorBody.push(`this.${flag} = (flags & ${mask}) === ${mask};`);
		}
	}
	const lazyFields: string[] = [];
	const getters: string[] = [];
	for (const [index, field] of fields.entries()) {
		if (isEagerScalar(name, field)) {
			declarations.push(`declare ${field.name}: ast.Lazy${name}['${field.name}'];`);
			constructorBody.push(
				`this.${field.name} = ${getEagerScalarExpression(name, field, node, `position + ${index + offset}`)};`
			);
			continue;
		}
		const getter = getFieldGetter(name, field, node, index + offset);
		if (getter) {
			lazyFields.push(field.name);
			getters.push(getter);
		}
	}
	for (const { code, fieldName } of getAdditionalFieldGetters(name, node, fields)) {
		lazyFields.push(fieldName);
		getters.push(code);
	}
	const fixedProperties = Object.entries({
		...node.fixed,
		type: `'${node.astType || name}'`
	})
		.sort(([key1], [key2]) => key1.localeCompare(key2))
		.map(([key, value]) => `${key}: ${value}`)
		.join(',\n\t');
	return `class ${className} {
	#position: number;
	#buffer: AstBuffer;
	${declarations.join('\n\t')}

	constructor(position: number, buffer: AstBuffer) {
		${constructorBody.join('\n\t\t')}
	}
${getters.length > 0 ? `\n\t${getters.join('\n\n\t')}\n` : ''}
	get parent() {
		const buffer = this.#buffer;
		const parentPosition = buffer[this.#position + ${NODE_PARENT_OFFSET}];
		return parentPosition === 0
			? null
			: convertNode(parentPosition - ${ENCODED_PARENT_BIAS}, buffer);
	}
}
setFixedProperties(${className}.prototype, {
	${fixedProperties}
});
${lazyFields.length > 0 ? `makeLazyFieldsEnumerable(${className}.prototype, [${lazyFields.map(fieldName => `'${fieldName}'`).join(', ')}]);` : ''}`;
}

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
	const returnType = `ast.Lazy${nodeName}['${field.name}']`;
	const fallback = node.optionalFallback?.[field.name];
	if (field.type === 'Node' && field.allowNull && fallback) {
		if (node.shorthandKey && field.name === 'key') {
			return `get ${field.name}(): ${returnType} {
		const buffer = this.#buffer;
		return this.shorthand
			? this.value.type === 'AssignmentPattern'
				? this.value.left as ${returnType}
				: this.value as ${returnType}
			: convertNode(buffer[this.#position + ${offset}], buffer);
	}`;
		}
		return `get ${field.name}(): ${returnType} {
		const buffer = this.#buffer;
		const ${field.name}Position = buffer[this.#position + ${offset}];
		return ${field.name}Position === 0
			? this.${fallback}
			: convertNode(${field.name}Position, buffer);
	}`;
	}
	if (field.type === 'Annotations') {
		return `get ${field.name}(): ${returnType} {
		const buffer = this.#buffer;
		const position = this.#position + ${offset};
		const annotations = convertAnnotations(buffer[position], buffer);
		return annotations.length > 0 ? annotations : undefined;
	}`;
	}
	if (field.type === 'String' && field.optional) {
		return `get ${field.name}(): ${returnType} {
		const buffer = this.#buffer;
		const position = this.#position + ${offset};
		return buffer[position] === 0 ? undefined : buffer.convertString(buffer[position]);
	}`;
	}
	return `get ${field.name}(): ${returnType} {
		const buffer = this.#buffer;
		const position = this.#position + ${offset};
		return ${getFieldExpression(nodeName, field, node, 'position')};
	}`;
}

function getEagerScalarExpression(
	nodeName: AstNodeName,
	field: FieldDescription,
	node: NodeDescription,
	positionExpression: string
): string {
	const expression = getFieldExpression(nodeName, field, node, positionExpression);
	return field.type === 'FixedString'
		? `${expression} as ast.Lazy${nodeName}['${field.name}']`
		: expression;
}

function getFieldExpression(
	nodeName: AstNodeName,
	field: FieldDescription,
	node: NodeDescription,
	positionExpression: string
): string {
	const dataPosition = `buffer[${positionExpression}]`;
	switch (field.type) {
		case 'Node': {
			if (node.optionalFallback?.[field.name]) {
				throw new Error(
					`The fallback field ${nodeName}.${field.name} must be generated in getFieldGetter`
				);
			}
			if (field.allowNull) {
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
			return `buffer.convertFloat64(${positionExpression})`;
		}
		default: {
			throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
		}
	}
}

function getBaseAssignment(
	nodeName: AstNodeName,
	base: string,
	node: NodeDescription,
	fields: FieldDescription[]
): string {
	const fieldIndex = fields.findIndex(field => field.name === base);
	if (fieldIndex >= 0) {
		const offset = fieldIndex + getOffset(node);
		const expression = getFieldExpression(
			nodeName,
			fields[fieldIndex],
			node,
			`position + ${offset}`
		);
		return `const ${base} = ${expression};`;
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
): { code: string; fieldName: string }[] {
	const baseAssignments = (node.baseForAdditionalFields || [])
		.map(base => getBaseAssignment(nodeName, base, node, fields))
		.join('\n\t\t');
	return Object.entries(node.additionalFields || {}).map(([fieldName, { value }]) => {
		const returnExpression = memoisedAdditionalFields.has(`${nodeName}.${fieldName}`)
			? `getNodeValue(this, '${fieldName}', () => (${value}))`
			: value;
		const lintSuppression = isLiteralExpression(value)
			? '// eslint-disable-next-line @typescript-eslint/class-literal-property-style -- constant fields must stay getters to not become own properties\n\t\t'
			: '';
		return {
			code: `${lintSuppression}get ${fieldName}(): ast.Lazy${nodeName}['${fieldName}'] {
		${baseAssignments.length === 0 ? '' : `const buffer = this.#buffer;\n\t\tconst position = this.#position;\n\t\t${baseAssignments}\n\t\t`}return ${returnExpression};
	}`,
			fieldName
		};
	});
}

function isLiteralExpression(value: string): boolean {
	return value === 'false' || value === 'null' || value === 'true';
}

const nodeSwitch = nodeClasses
	.map(
		({ className, nodeType }) =>
			`case ${nodeType}:\n\t\t\treturn new ${className}(position, buffer);`
	)
	.join('\n\t\t');

const bufferToJsAst = `${notEditFilesComment}
import { PanicError, ParseError } from '../ast/nodes/NodeType';
import type { ast } from '../rollup/types';
import { convertAnnotations } from './astConverterHelpers';
import { EMPTY_ARRAY } from './blank';
import FIXED_STRINGS from './convert-ast-strings';
import type { AstBuffer } from './getAstBuffer';
import { error, getRollupError, logParseError } from './logs';

function setFixedProperties(prototype: object, values: Record<string, unknown>): void {
	for (const [key, value] of Object.entries(values)) {
		Object.defineProperty(prototype, key, {
			configurable: true,
			enumerable: true,
			value,
			writable: true
		});
	}
}

/* Class getters are not enumerable, so only AST fields are made enumerable;
   the parent must stay hidden as for..in based walkers like estree-walker
   would otherwise traverse it into cycles. */
function makeLazyFieldsEnumerable(prototype: object, keys: readonly string[]): void {
	for (const key of keys) {
		Object.defineProperty(prototype, key, { enumerable: true });
	}
}

function getNodeValue<T>(node: object, key: string, createValue: () => T): T {
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
	const node = createNode(position, buffer);
	cache.set(position, node);
	return node;
}

/* Kept apart from convertNode so that convertNode stays small enough to be inlined into getters. */
function createNode(position: number, buffer: AstBuffer): ast.LazyNode<ast.AstNode> {
	switch (buffer[position]) {
		${nodeSwitch}
		default: {
			/* istanbul ignore next: This should never be executed but is a safeguard against faulty buffers */
			console.trace();
			throw new Error(\`Unknown node type: \${buffer[position]}\`);
		}
	}
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

${nodeClasses.map(({ code }) => code).join('\n\n')}
`;

await writeFile(bufferToJsAstFile, bufferToJsAst);
await lintTsFile(bufferToJsAstFile);
