import { writeFile } from 'node:fs/promises';
import type { FieldDescription, NodeDescription } from './ast-types.ts';
import { astNodeNamesWithFieldOrder } from './ast-types.ts';
import { firstLettersLowercase, generateNotEditFilesComment, lintTsFile } from './helpers.ts';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const bufferToJsAstFile = new URL('../src/utils/bufferToLazyAst.ts', import.meta.url);

const jsConverters = astNodeNamesWithFieldOrder.map(({ name, fields, node }) => {
	const definitions: string[] = [];
	const postAssignments: string[] = [];
	let offset = 3;
	if (node.flags) {
		offset++;
		definitions.push('const flags = buffer[position + 3];\n');
		for (const [index, flag] of node.flags.entries()) {
			if (isHoistedField(flag, node)) {
				definitions.push(`const ${flag} = (flags & ${1 << index}) === ${1 << index};`);
			}
		}
	}
	for (const [index, field] of fields.entries()) {
		definitions.push(getFieldDefinition(field, index + offset));
		if (isHoistedChildField(field, node)) {
			postAssignments.push(
				`node.${field.name} = ${getFieldPropertyBase(field, name, node, index + offset)};\n`
			);
		} else if (isHoistedField(field.name, node)) {
			definitions.push(
				`const ${field.name} = ${getFieldPropertyBase(field, name, node, index + offset)};`
			);
		}
	}
	const properties: string[] = [
		...(node.flags || []).map((name, index) =>
			isHoistedField(name, node) ? name : `${name}: (flags & ${1 << index}) === ${1 << index}`
		),
		...fields
			.map((field, index) =>
				isHoistedChildField(field, node)
					? `${field.name}: null as never`
					: getFieldProperty(field, name, node, index + offset)
			)
			.filter((property): property is string => !!property),
		...getFixedProperties(node),
		...Object.entries(node.additionalFields || []).map(([key, { value }]) => `${key}: ${value}`)
	];
	return `function ${node.converterFunction || firstLettersLowercase(name)} (position, buffer, parent): ast.${name} {
    ${definitions.join('')}const node: ast.${name} =  {
      type: '${node.astType || name}',
      start: buffer[position + 1],
      end: buffer[position + 2],
      ${properties.join(',\n')}
    };
    ${postAssignments.join('')}defineParent(node, position, buffer, parent);
    return node;
  }`;
});

function isHoistedField(name: string, node: NodeDescription): boolean | undefined {
	return (
		node.baseForAdditionalFields?.includes(name) ||
		(node.optionalFallback && Object.values(node.optionalFallback).includes(name))
	);
}

function isHoistedChildField(field: FieldDescription, node: NodeDescription): boolean {
	return (
		isHoistedField(field.name, node) === true &&
		(field.type === 'Node' || field.type === 'NodeList')
	);
}

function getFieldDefinition(field: FieldDescription, offset: number): string {
	const position = `position + ${offset}`;
	const dataStart = `buffer[${position}]`;
	switch (field.type) {
		case 'NodeList':
		case 'Float':
		case 'ScopeOffset': {
			return '';
		}
		case 'Node': {
			return field.allowNull ? `const ${field.name}Position = ${dataStart};\n` : '';
		}
		case 'Annotations': {
			return `const ${field.name} = convertAnnotations(${dataStart}, buffer);\n`;
		}
		case 'String':
		case 'FixedString': {
			return field.optional ? `const ${field.name}Position = ${dataStart};\n` : '';
		}
		default: {
			throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
		}
	}
}

function getFieldProperty(
	field: FieldDescription,
	nodeName: string,
	node: NodeDescription,
	offset: number
): string {
	if (node.serializeHiddenFields?.[field.name]) {
		return '';
	}
	if (isHoistedField(field.name, node)) {
		return field.name;
	}
	switch (field.type) {
		case 'ScopeOffset': {
			return '';
		}
		case 'Annotations': {
			return `...(${field.name}.length > 0 ? { ${field.name} } : {})`;
		}
		default: {
			return `get ${field.name}() {
			  const result = ${getFieldPropertyBase(field, nodeName, node, offset)};
			  Object.defineProperty(node, '${field.name}', { value: result });
			  return result;
			}`;
		}
	}
}

function getFieldPropertyBase(
	field: FieldDescription,
	nodeName: string,
	node: NodeDescription,
	offset: number
): string {
	const position = `position + ${offset}`;
	const dataStart = `buffer[${position}]`;
	switch (field.type) {
		case 'Node': {
			if (field.allowNull) {
				const fallback = node.optionalFallback?.[field.name];
				if (fallback) {
					if (node.shorthandKey && field.name === 'key') {
						return `node.shorthand ? (node.value.type === 'AssignmentPattern' ? node.value.left : node.value) : convertNode(${field.name}Position, buffer, node)`;
					}
					return `${field.name}Position === 0 ? node.${fallback} : convertNode(${field.name}Position, buffer, node)`;
				}
				return `${field.name}Position === 0 ? null : convertNode(${field.name}Position, buffer, node)`;
			}
			return `convertNode(${dataStart}, buffer, node)`;
		}
		case 'NodeList': {
			return `convertNodeList(${dataStart}, buffer, node)`;
		}
		case 'String': {
			return field.optional
				? `${field.name}Position === 0 ? undefined : buffer.convertString(${field.name}Position)`
				: `buffer.convertString(${dataStart})`;
		}
		case 'FixedString': {
			return field.optional
				? `${field.name}Position === 0 ? undefined : FIXED_STRINGS[${dataStart}] as ast.${nodeName}['${field.name}']`
				: `FIXED_STRINGS[${dataStart}] as ast.${nodeName}['${field.name}']`;
		}
		case 'Float': {
			return `buffer.convertFloat64(${position})`;
		}
		case 'ScopeOffset': {
			return '';
		}
		default: {
			throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
		}
	}
}

function getFixedProperties(node: NodeDescription): string[] {
	return Object.entries(node.fixed || {}).map(([key, value]) => `${key}: ${value}`);
}

const bufferToJsAst = `${notEditFilesComment}
import { PanicError, ParseError } from '../ast/nodes/NodeType';import type { RollupAstNode } from '../rollup/types';
import type { ast } from '../rollup/types';
import type { RollupAnnotation } from './astConverterHelpers';
import { convertAnnotations } from './astConverterHelpers';
import { EMPTY_ARRAY } from './blank';
import FIXED_STRINGS from './convert-ast-strings';
import type { AstBuffer } from './getAstBuffer';
import { error, getRollupError, logParseError } from './logs';

export const deserializeLazyAstBuffer = (buffer: AstBuffer, position: number): ast.AstNode => {
  const node = convertNode(position, buffer, null);
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

/* eslint-disable sort-keys */
const nodeConverters: ((position: number, buffer: AstBuffer, parent: ast.AstNode | null) => ast.AstNode)[] = [
  ${jsConverters.join(',\n')}
];

export function convertNode(position: number, buffer: AstBuffer, parent: ast.AstNode | null): any {
  const cachedNode = buffer.lazyNodes?.get(position);
  if (cachedNode !== undefined) {
    return cachedNode;
  }
  const nodeType = buffer[position];
  const converter = nodeConverters[nodeType];
  /* istanbul ignore if: This should never be executed but is a safeguard against faulty buffers */
  if (!converter) {
    console.trace();
    throw new Error(\`Unknown node type: \${nodeType}\`);
  }
  const node = converter(position + 1, buffer, parent);
  if (buffer.lazyNodes) {
    buffer.lazyNodes.set(position, node);
  }
  return node;
}

const parentPropertyDescriptor: PropertyDescriptor = {
  configurable: true,
  enumerable: false,
  value: undefined,
  writable: true
};

function setParent(node: ast.AstNode, parent: ast.AstNode | null): void {
  parentPropertyDescriptor.value = parent;
  Object.defineProperty(node, 'parent', parentPropertyDescriptor);
}

function defineParent(
  node: ast.AstNode,
  position: number,
  buffer: AstBuffer,
  parent: ast.AstNode | null
): void {
  if (parent !== null || buffer[position] === 0) {
    setParent(node, parent);
    return;
  }
  Object.defineProperty(node, 'parent', {
    configurable: true,
    enumerable: false,
    get() {
      const cache = (buffer.lazyNodes ??= new Map());
      const typePosition = position - 1;
      if (!cache.has(typePosition)) {
        cache.set(typePosition, node);
      }
      const resolvedParent = convertNode(buffer[position] - 1, buffer, null);
      if (Object.isExtensible(node)) {
        setParent(node, resolvedParent);
      }
      return resolvedParent;
    }
  });
}

function convertNodeList(position: number, buffer: AstBuffer, parent: ast.AstNode | null): readonly any[] {
  if (position === 0) return EMPTY_ARRAY;
  const length = buffer[position++];
  const list: any[] = new Array(length);
  for (let index = 0; index < length; index++) {
    const nodePosition = buffer[position++];
    list[index] = nodePosition ? convertNode(nodePosition, buffer, parent) : null;
  }
  return list;
}
`;

await writeFile(bufferToJsAstFile, bufferToJsAst);
await lintTsFile(bufferToJsAstFile);
